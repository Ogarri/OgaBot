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
        let start = 0;
        const pageSize = 100;

        while (true) {
            const url = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${pageSize}&api_key=${LOL_API_KEY}`;
            const matchIds = await makeRequest(url);
            
            if (!matchIds || matchIds.length === 0) {
                return null;
            }

            for (const matchId of matchIds) {
                const matchDetails = await getMatchDetails(matchId);
                if (matchDetails && matchDetails.info.queueId === 420) {
                    return matchId;
                }
            }

            if (matchIds.length < pageSize) break;
            start += pageSize;
        }
        
        return null;
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

async function getLeagueInfo(puuid) {
    try {
        const url = `https://euw1.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${LOL_API_KEY}`;
        const leagueData = await makeRequest(url);
        if (leagueData && leagueData.length > 0) {
            // Trouver l'entrée RANKED_SOLO_5x5
            const rankedData = leagueData.find(entry => entry.queueType === 'RANKED_SOLO_5x5');
            if (rankedData) {
                return {
                    tier: rankedData.tier,
                    rank: rankedData.rank,
                    lp: rankedData.leaguePoints
                };
            }
        }
        return null;
    } catch (err) {
        throw new Error(`Erreur ligue: ${err.message}`);
    }
}

function getLastMatches() {
    if (!fs.existsSync(LAST_MATCHES_FILE)) {
        return {};
    }
    const data = fs.readFileSync(LAST_MATCHES_FILE, 'utf8');
    return JSON.parse(data);
}

function saveLastMatch(discordId, matchId, lp) {
    let lastMatches = getLastMatches();
    lastMatches[discordId] = {
        matchId: matchId,
        lp: lp
    };
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
            const lastMatchData = lastMatches[discordId];
            const lastMatchId = typeof lastMatchData === 'object' ? lastMatchData.matchId : lastMatchData;

            if (latestMatchId && latestMatchId !== lastMatchId) {
                const matchDetails = await getMatchDetails(latestMatchId);
                
                if (matchDetails && matchDetails.info.queueId === 420) {
                    const info = matchDetails.info;
                    const participant = info.participants.find(p => p.puuid === account.puuid);
                    const totalSeconds = info.gameDuration;
                    const minutes = Math.floor(totalSeconds / 60);
                    const seconds = totalSeconds % 60;
                    const gameDurationFormatted = `${minutes}m${seconds}s`;
                    const result = participant.win ? '✓ Victoire' : '✗ Défaite';
                    const resultColor = participant.win ? '#00ff00' : '#ff0000';
                    const kda = `${participant.kills}/${participant.deaths}/${participant.assists}`;
                    const champion = participant.championName;
                    const damage = participant.totalDamageDealtToChampions;
                    const totalCS = participant.totalMinionsKilled + participant.neutralMinionsKilled;
                    const csPerMin = (totalCS / (totalSeconds / 60)).toFixed(2);
                    const timestamp = new Date(info.gameStartTimestamp).toLocaleString();

                    // Récupérer les infos de ligue actuelle
                    let leagueInfo = null;
                    let lpChangeText = '';
                    let lpChanged = false;
                    try {
                        leagueInfo = await getLeagueInfo(account.puuid);
                        const lastMatchData = lastMatches[discordId];
                        const previousLp = typeof lastMatchData === 'object' ? lastMatchData.lp : 0;
                        if (leagueInfo) {
                            const lpChange = leagueInfo.lp - previousLp;
                            if (lpChange !== 0) {
                                lpChanged = true;
                                const lpChangeSymbol = lpChange > 0 ? '📈' : '📉';
                                lpChangeText = `${lpChangeSymbol} ${lpChange > 0 ? '+' : ''}${lpChange} LP (${previousLp} → ${leagueInfo.lp})`;
                            }
                        }
                    } catch (err) {
                        console.error(`[FOLLOWHERE] Erreur récupération ligue:`, err.message);
                    }

                    const embedFields = [
                        { name: '⚔️ Champion', value: champion, inline: true },
                        { name: '📊 Résultat', value: result, inline: true },
                        { name: '💀 K/D/A', value: kda, inline: true },
                        { name: '🔥 Dégâts', value: damage.toString(), inline: true },
                        { name: '⏱️ Durée', value: gameDurationFormatted, inline: true },
                        { name: '🌾 CS/min', value: csPerMin, inline: true }
                    ];

                    if (leagueInfo && lpChanged) {
                        embedFields.push(
                            { name: '🏅 Rang', value: `${leagueInfo.tier} ${leagueInfo.rank}`, inline: true },
                            { name: '⭐ LP', value: leagueInfo.lp.toString(), inline: true }
                        );
                    }

                    if (lpChangeText) {
                        embedFields.push(
                            { name: '📊 Changement LP', value: lpChangeText, inline: false }
                        );
                    }

                    embedFields.push(
                        { name: '🆔 Match ID', value: `\`${latestMatchId}\``, inline: false }
                    );

                    const embed = new EmbedBuilder()
                        .setColor(resultColor)
                        .setTitle(`🎮 ${account.gameName}#${account.tagLine}`)
                        .setDescription(`Vient de terminer une partie`)
                        .addFields(...embedFields)
                        .setFooter({ text: timestamp });

                    await channel.send({ embeds: [embed] });
                    if (leagueInfo) {
                        saveLastMatch(discordId, latestMatchId, leagueInfo.lp);
                    } else {
                        const lastMatchData = lastMatches[discordId];
                        const previousLp = typeof lastMatchData === 'object' ? lastMatchData.lp : 0;
                        saveLastMatch(discordId, latestMatchId, previousLp);
                    }
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
