require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const LOL_API_KEY = process.env.LOL_API_KEY;
const ACCOUNTS_FILE = path.join(__dirname, '../../assets/lolacc.json');
const LAST_MATCHES_FILE = path.join(__dirname, '../../assets/lastMatches.json');

// Map partagée
let activeLoops = new Map();

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

async function getLatestMatchId(puuid) {
    try {
        const url = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1&api_key=${LOL_API_KEY}`;
        const matchIds = await makeRequest(url);
        return matchIds[0] || null;
    } catch (err) {
        throw new Error(`Erreur match: ${err.message}`);
    }
}

async function getMatchDetails(matchId) {
    try {
        const url = `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${LOL_API_KEY}`;
        const matchData = await makeRequest(url);
        return matchData;
    } catch (err) {
        throw new Error(`Erreur détails: ${err.message}`);
    }
}

function getLastMatches() {
    if (!fs.existsSync(LAST_MATCHES_FILE)) {
        return {};
    }
    const data = fs.readFileSync(LAST_MATCHES_FILE, 'utf8');
    return JSON.parse(data);
}

function saveLastMatch(discordId, matchId) {
    let lastMatches = getLastMatches();
    lastMatches[discordId] = matchId;
    fs.writeFileSync(LAST_MATCHES_FILE, JSON.stringify(lastMatches, null, 2));
}

function getAllAccounts() {
    if (!fs.existsSync(ACCOUNTS_FILE)) {
        return {};
    }
    const data = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
    return JSON.parse(data);
}

async function checkNewMatches(channel, client) {
    console.log(`[FOLLOWHERE] Vérification des matchs pour le canal ${channel.name} (${channel.id})`);
    const accounts = getAllAccounts();
    const lastMatches = getLastMatches();

    for (const [discordId, account] of Object.entries(accounts)) {
        try {
            const latestMatchId = await getLatestMatchId(account.puuid);
            const lastMatchId = lastMatches[discordId];

            if (latestMatchId && latestMatchId !== lastMatchId) {
                const matchDetails = await getMatchDetails(latestMatchId);
                
                if (matchDetails && matchDetails.info.queueId === 420) {
                    const info = matchDetails.info;
                    const participant = info.participants.find(p => p.puuid === account.puuid);
                    const gameDuration = Math.floor(info.gameDuration / 60);
                    const result = participant.win ? '✓ Victoire' : '✗ Défaite';
                    const resultColor = participant.win ? '#00ff00' : '#ff0000';
                    const kda = `${participant.kills}/${participant.deaths}/${participant.assists}`;
                    const champion = participant.championName;
                    const damage = participant.totalDamageDealt;
                    const timestamp = new Date(info.gameStartTimestamp).toLocaleString();

                    const embed = new EmbedBuilder()
                        .setColor(resultColor)
                        .setTitle(`🎮 ${account.gameName}#${account.tagLine}`)
                        .setDescription(`Vient de terminer une partie`)
                        .addFields(
                            { name: '⚔️ Champion', value: champion, inline: true },
                            { name: '📊 Résultat', value: result, inline: true },
                            { name: '💀 K/D/A', value: kda, inline: true },
                            { name: '🔥 Dégâts', value: damage.toString(), inline: true },
                            { name: '⏱️ Durée', value: `${gameDuration}m`, inline: true },
                            { name: '🆔 Match ID', value: `\`${latestMatchId}\``, inline: false }
                        )
                        .setFooter({ text: timestamp });

                    await channel.send({ embeds: [embed] });
                    saveLastMatch(discordId, latestMatchId);
                    console.log(`[FOLLOWHERE] Nouveau match détecté pour ${account.gameName}#${account.tagLine}`);
                }
            }
        } catch (err) {
            console.error(`[FOLLOWHERE] Erreur pour ${account.gameName}:`, err.message);
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('followherestart')
        .setDescription('Détecte les nouvelles parties ranked toutes les 2 minutes'),
    async execute(interaction) {
        const channelId = interaction.channelId;
        
        if (activeLoops.has(channelId)) {
            return await interaction.reply({ 
                content: '⚠️ Une boucle est déjà active dans ce canal!',
                ephemeral: true 
            });
        }

        await interaction.reply('▶️ Suivi des matchs activé! Je vais vérifier toutes les 2 minutes.');

        const channel = interaction.channel;
        const intervalId = setInterval(() => checkNewMatches(channel, interaction.client), 120000);

        activeLoops.set(channelId, intervalId);

        // Première vérification immédiate
        await checkNewMatches(channel, interaction.client);
    },
    getActiveLoops: () => activeLoops
};
