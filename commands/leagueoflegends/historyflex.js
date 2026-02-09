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

async function getLastMatches(puuid, limit = 20) {
    try {
        const lastMatches = [];
        const matchIds = await getAllMatchIds(puuid, limit);
        
        for (const matchId of matchIds) {
            const matchDetails = await getMatchDetails(matchId);
            if (matchDetails) {
                lastMatches.push(matchDetails);
            }
        }
        return lastMatches;
    } catch (err) {
        throw new Error(`Erreur matchs: ${err.message}`);
    }
}

function getQueueName(queueId) {
    const queues = {
        0: '🎮 Custom games',
        2: '🎮 5v5 Blind Pick',
        4: '🏆 5v5 Ranked Solo',
        6: '🏆 5v5 Ranked Premade',
        7: '🤖 Co-op vs AI',
        8: '🎮 3v3 Normal',
        9: '🏆 3v3 Ranked Flex',
        14: '🎮 5v5 Draft Pick',
        16: '🎮 5v5 Dominion Blind Pick',
        17: '🎮 5v5 Dominion Draft Pick',
        25: '🤖 Dominion Co-op vs AI',
        31: '🤖 Co-op vs AI Intro Bot',
        32: '🤖 Co-op vs AI Beginner Bot',
        33: '🤖 Co-op vs AI Intermediate Bot',
        41: '🏆 3v3 Ranked Team',
        42: '🏆 5v5 Ranked Team',
        52: '🤖 3v3 Co-op vs AI',
        61: '🎮 5v5 Team Builder',
        65: '🎉 5v5 ARAM',
        67: '🤖 ARAM Co-op vs AI',
        70: '⚡ One for All',
        72: '❄️ 1v1 Snowdown Showdown',
        73: '❄️ 2v2 Snowdown Showdown',
        75: '🎮 6v6 Hexakill',
        76: '⚡ Ultra Rapid Fire',
        78: '⚡ One For All Mirror Mode',
        83: '🤖 Co-op vs AI URF',
        91: '☠️ Doom Bots Rank 1',
        92: '☠️ Doom Bots Rank 2',
        93: '☠️ Doom Bots Rank 5',
        96: '🎮 Ascension',
        98: '🎮 6v6 Hexakill (3v3)',
        100: '🎉 5v5 ARAM (Butcher\'s Bridge)',
        300: '👑 Legend of the Poro King',
        310: '🎮 Nemesis',
        313: '🎮 Black Market Brawlers',
        315: '🎮 Nexus Siege',
        317: '🎮 Definitely Not Dominion',
        318: '⚡ ARURF',
        325: '🎮 All Random',
        400: '🎮 5v5 Draft Pick',
        410: '🏆 5v5 Ranked Dynamic',
        420: '🏆 5v5 Ranked Solo',
        430: '🎮 5v5 Blind Pick',
        440: '🏆 5v5 Ranked Flex',
        450: '🎉 5v5 ARAM',
        460: '🎮 3v3 Blind Pick',
        470: '🏆 3v3 Ranked Flex',
        480: '⚡ Swiftplay',
        490: '🎮 Normal (Quickplay)',
        600: '🎮 Blood Hunt Assassin',
        610: '🎮 Dark Star Singularity',
        700: '⚔️ Summoner\'s Rift Clash',
        720: '⚔️ ARAM Clash',
        800: '🤖 3v3 Co-op vs AI Intermediate',
        810: '🤖 3v3 Co-op vs AI Intro',
        820: '🤖 3v3 Co-op vs AI Beginner',
        830: '🤖 Co-op vs AI Intro Bot',
        840: '🤖 Co-op vs AI Beginner Bot',
        850: '🤖 Co-op vs AI Intermediate Bot',
        870: '🤖 Co-op vs AI Intro Bot',
        880: '🤖 Co-op vs AI Beginner Bot',
        890: '🤖 Co-op vs AI Intermediate Bot',
        900: '⚡ ARURF',
        910: '🎮 Ascension',
        920: '👑 Legend of the Poro King',
        940: '🎮 Nexus Siege',
        950: '☠️ Doom Bots Voting',
        960: '☠️ Doom Bots Standard',
        980: '🌟 Star Guardian Invasion Normal',
        990: '🌟 Star Guardian Invasion Onslaught',
        1000: '🎮 PROJECT Hunters',
        1010: '❄️ Snow ARURF',
        1020: '⚡ One for All',
        1030: '🚀 Odyssey Extraction Intro',
        1040: '🚀 Odyssey Extraction Cadet',
        1050: '🚀 Odyssey Extraction Crewmember',
        1060: '🚀 Odyssey Extraction Captain',
        1070: '🚀 Odyssey Extraction Onslaught',
        1090: '🎲 Teamfight Tactics',
        1100: '🏆 Ranked Teamfight Tactics',
        1110: '📚 Teamfight Tactics Tutorial',
        1111: '🎲 Teamfight Tactics Test',
        1200: '💥 Nexus Blitz',
        1210: '🎲 TFT Choncc\'s Treasure Mode',
        1300: '💥 Nexus Blitz',
        1400: '🎮 Ultimate Spellbook',
        1700: '🎪 Arena',
        1710: '🎪 Arena (16 players)',
        1810: '🐝 Swarm (1 player)',
        1820: '🐝 Swarm (2 players)',
        1830: '🐝 Swarm (3 players)',
        1840: '🐝 Swarm (4 players)',
        1900: '⚡ Pick URF',
        2000: '📚 Tutorial 1',
        2010: '📚 Tutorial 2',
        2020: '📚 Tutorial 3',
        2300: '🎪 Brawl',
        2400: '🎉 ARAM Mayhem'
    };
    return queues[queueId] || `Mode ${queueId}`;
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
        .setName('historyflex')
        .setDescription('Affiche vos matchs classés 5v5 Flex parmi les 20 dernières parties.'),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const account = getAccountFromFile(interaction.user.id);
            const lastMatches = await getLastMatches(account.puuid, 20);
            
            // Filtrer pour ne garder que les matchs classés Flex (queueId 440)
            const rankedFlexMatches = lastMatches.filter(match => match.info.queueId === 440);
            
            if (rankedFlexMatches.length === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6600')
                    .setTitle('⚠️ Aucun match Flex trouvé')
                    .setDescription('Il n\'y a pas de matchs Flex dans les 20 derniers matchs.');
                
                return await interaction.editReply({ embeds: [errorEmbed] });
            }
            
            const embeds = [];
            const matchesPerEmbed = 5;
            
            // Créer tous les embeds
            for (let i = 0; i < rankedFlexMatches.length; i += matchesPerEmbed) {
                const embedMatches = rankedFlexMatches.slice(i, i + matchesPerEmbed);
                const pageNum = Math.floor(i / matchesPerEmbed) + 1;
                const totalPages = Math.ceil(rankedFlexMatches.length / matchesPerEmbed);
                
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`📊 Historique Flex de ${account.gameName}#${account.tagLine}`);
                
                if (totalPages > 1) {
                    embed.setDescription(`Page ${pageNum}/${totalPages} • ${rankedFlexMatches.length} matchs Flex`);
                } else {
                    embed.setDescription(`${rankedFlexMatches.length} matchs Flex`);
                }
                
                embedMatches.forEach((match, localIndex) => {
                    const globalIndex = i + localIndex;
                    const info = match.info;
                    const totalSeconds = info.gameDuration;
                    const minutes = Math.floor(totalSeconds / 60);
                    const seconds = totalSeconds % 60;
                    const gameDurationFormatted = `${minutes}m${seconds}s`;
                    const participant = info.participants.find(p => p.puuid === account.puuid);
                    
                    const result = participant.win ? '✅ Victoire' : '❌ Défaite';
                    const embedColor = participant.win ? '#5cb85c' : '#d9534f';
                    const kda = `${participant.kills}/${participant.deaths}/${participant.assists}`;
                    const kdaRatio = participant.deaths > 0 ? ((participant.kills + participant.assists) / participant.deaths).toFixed(2) : (participant.kills + participant.assists);
                    const champion = participant.championName;
                    const damage = participant.totalDamageDealtToChampions.toLocaleString('fr-FR');
                    const totalCS = participant.totalMinionsKilled + participant.neutralMinionsKilled;
                    const csPerMin = (totalCS / (totalSeconds / 60)).toFixed(1);
                    const gold = (participant.goldEarned / 1000).toFixed(1);
                    const level = participant.champLevel;
                    const queueName = getQueueName(info.queueId);
                    
                    const fieldValue = [
                        `${result}`,
                        `⚔️ **${champion}** niveau ${level}`,
                        `💀 **K/D/A:** ${kda} (ratio: ${kdaRatio})`,
                        `🔥 **Dégâts:** ${damage}`,
                        `💰 **Or:** ${gold}k`,
                        `🌾 **CS:** ${totalCS} (${csPerMin}/min)`,
                        `⏱️ **Durée:** ${gameDurationFormatted}`,
                        `🎮 ${queueName}`
                    ].join('\n');
                    
                    embed.addFields({
                        name: `Match ${globalIndex + 1} ${embedColor === '#5cb85c' ? '🟢' : '🔴'}`,
                        value: fieldValue,
                        inline: false
                    });
                });
                
                embed.setFooter({ text: `${interaction.user.username} • ${new Date().toLocaleString('fr-FR')}` });
                embeds.push(embed);
            }
            
            // S'il y a une seule page, afficher directement
            if (embeds.length === 1) {
                await interaction.editReply({ embeds: [embeds[0]] });
                return;
            }
            
            // Pagination: afficher la première page et ajouter les réactions
            const message = await interaction.editReply({ embeds: [embeds[0]] });
            
            await message.react('⬅️');
            await message.react('➡️');
            
            let currentPage = 0;
            
            const filter = (reaction, user) => {
                return ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === interaction.user.id;
            };
            
            const collector = message.createReactionCollector({ filter, time: 600000 }); // 10 minutes
            
            collector.on('collect', async (reaction, user) => {
                try {
                    if (reaction.emoji.name === '⬅️') {
                        if (currentPage > 0) {
                            currentPage--;
                            await message.edit({ embeds: [embeds[currentPage]] });
                        }
                    } else if (reaction.emoji.name === '➡️') {
                        if (currentPage < embeds.length - 1) {
                            currentPage++;
                            await message.edit({ embeds: [embeds[currentPage]] });
                        }
                    }
                    
                    // Retirer la réaction de l'utilisateur
                    await reaction.users.remove(user.id);
                } catch (err) {
                    console.error('Erreur lors de la gestion des réactions:', err);
                }
            });
            
            collector.on('end', () => {
                message.reactions.removeAll().catch(() => {});
            });
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
