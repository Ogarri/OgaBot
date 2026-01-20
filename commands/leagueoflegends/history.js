require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');

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

async function getAllMatchIds(puuid, limit = 20) {
    try {
        const allMatchIds = [];
        let start = 0;
        const pageSize = 100;

        while (allMatchIds.length < limit) {
            const url = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${pageSize}&api_key=${LOL_API_KEY}`;
            const matchIds = await makeRequest(url);
            
            if (!matchIds || matchIds.length === 0) {
                break;
            } else {
                allMatchIds.push(...matchIds);
                start += pageSize;
            }
        }
        return allMatchIds.slice(0, limit);
    } catch (err) {
        throw new Error(`Erreur matchs: ${err.message}`);
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

async function getRankedMatches(puuid, limit = 20) {
    try {
        const matchIds = await getAllMatchIds(puuid, limit * 2);
        const rankedMatches = [];

        for (const matchId of matchIds) {
            if (rankedMatches.length >= limit) break;
            
            const matchDetails = await getMatchDetails(matchId);
            if (matchDetails && matchDetails.info.queueId === 420) {
                rankedMatches.push(matchDetails);
            }
        }
        return rankedMatches;
    } catch (err) {
        throw new Error(`Erreur ranked: ${err.message}`);
    }
}

function getAccountFromFile(discordId) {
    if (!fs.existsSync(ACCOUNTS_FILE)) {
        throw new Error('Aucun compte lié trouvé');
    }
    
    const data = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
    const accounts = JSON.parse(data);
    
    if (!accounts[discordId]) {
        throw new Error('Votre compte LOL n\'est pas lié. Utilisez `!loglolacc <gameName> <tagLine>`');
    }
    
    return accounts[discordId];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('history')
        .setDescription('Affiche l\'historique de vos 5 derniers matchs ranked dans la limite des 20 derniers matchs.'),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const account = getAccountFromFile(interaction.user.id);
            const rankedMatches = await getRankedMatches(account.puuid, 5);
            
            if (rankedMatches.length === 0) {
                return await interaction.editReply('Aucun match ranked trouvé dans les 20 dernière parties.');
            }
            
            let response = `**Historique de ${account.gameName}#${account.tagLine}** (${rankedMatches.length} matchs)\n\n`;
            
            rankedMatches.forEach((match, index) => {
                const info = match.info;
                const gameDuration = Math.floor(info.gameDuration / 60);
                const participant = info.participants.find(p => p.puuid === account.puuid);
                const result = participant.win ? '✓ Victoire' : '✗ Défaite';
                const kda = `${participant.kills}/${participant.deaths}/${participant.assists}`;
                const champion = participant.championName;
                
                response += `${index + 1}. **${champion}** | ${result} | K/D/A: ${kda} | ${gameDuration}m\n`;
            });
            
            await interaction.editReply(response);
        } catch (err) {
            await interaction.editReply(`✗ Erreur: ${err.message}`);
        }
    }
};
