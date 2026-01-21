require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const LOL_API_KEY = process.env.LOL_API_KEY;
const ACCOUNTS_FILE = path.join(__dirname, '../../assets/lolacc.json');

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Erreur ${res.statusCode}: ${res.statusMessage}`));
                }
            });
        }).on('error', reject);
    });
}

async function getPuuid(gameName, tagLine) {
    try {
        const url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${LOL_API_KEY}`;
        const data = await makeRequest(url);
        return data.puuid;
    } catch (err) {
        throw new Error(`Erreur PUUID: ${err.message}`);
    }
}

function saveAccount(discordId, gameName, tagLine, puuid) {
    let accounts = {};
    
    if (fs.existsSync(ACCOUNTS_FILE)) {
        const data = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
        accounts = JSON.parse(data);
    }
    
    accounts[discordId] = {
        gameName,
        tagLine,
        puuid,
        savedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
}

async function refreshAllPuuids() {
    let accounts = {};
    
    if (!fs.existsSync(ACCOUNTS_FILE)) {
        throw new Error('Aucun compte enregistré trouvé');
    }
    
    const data = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
    accounts = JSON.parse(data);
    
    const results = {
        updated: [],
        failed: []
    };
    
    for (const [discordId, account] of Object.entries(accounts)) {
        try {
            const newPuuid = await getPuuid(account.gameName, account.tagLine);
            saveAccount(discordId, account.gameName, account.tagLine, newPuuid);
            results.updated.push({
                gameName: account.gameName,
                tagLine: account.tagLine,
                discordId
            });
        } catch (err) {
            results.failed.push({
                gameName: account.gameName,
                tagLine: account.tagLine,
                discordId,
                error: err.message
            });
        }
    }
    
    return results;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('refreshpuuid')
        .setDescription('Actualise les PUUID de tous les comptes enregistrés'),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const results = await refreshAllPuuids();
            
            let description = '';
            
            if (results.updated.length > 0) {
                description += `✓ **Mis à jour (${results.updated.length})**\n`;
                results.updated.forEach(account => {
                    description += `• ${account.gameName}#${account.tagLine}\n`;
                });
            }
            
            if (results.failed.length > 0) {
                if (description) description += '\n';
                description += `✗ **Erreurs (${results.failed.length})**\n`;
                results.failed.forEach(account => {
                    description += `• ${account.gameName}#${account.tagLine}: ${account.error}\n`;
                });
            }
            
            const embed = new EmbedBuilder()
                .setColor(results.failed.length === 0 ? '#00ff00' : '#ffaa00')
                .setTitle('Actualisation des PUUID')
                .setDescription(description || 'Aucun compte à actualiser')
                .setFooter({ text: interaction.user.username })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed] });
            console.log(`[LOL] ${interaction.user.username} (${interaction.user.id}) a actualisé les PUUID. Mis à jour: ${results.updated.length}, Erreurs: ${results.failed.length}`);
        } catch (err) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('✗ Erreur')
                .setDescription(err.message)
                .setFooter({ text: interaction.user.username })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
