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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loglolacc')
        .setDescription('Lie votre compte League of Legends à Discord')
        .addStringOption(option =>
            option.setName('gamename').setDescription('Votre nom invocateur').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('tagline').setDescription('Votre tag (#XXXX)').setRequired(true)
        ),
    async execute(interaction) {
        const gameName = interaction.options.getString('gamename');
        const tagLine = interaction.options.getString('tagline');

        try {
            await interaction.deferReply();
            const puuid = await getPuuid(gameName, tagLine);
            
            saveAccount(interaction.user.id, gameName, tagLine, puuid);
            console.log(`[LOL] ${interaction.user.username} (${interaction.user.id}) s'est connecté avec ${gameName}#${tagLine}`);
            
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('✓ Compte lié avec succès!')
                .addFields(
                    { name: '👤 Nom invocateur', value: `${gameName}#${tagLine}`, inline: false },
                    { name: '🆔 PUUID', value: `\`${puuid}\``, inline: false }
                )
                .setFooter({ text: interaction.user.username })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed] });
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
