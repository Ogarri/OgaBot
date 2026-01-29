require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');

const LOL_API_KEY = process.env.LOL_API_KEY;
const ACCOUNTS_FILE = path.join(__dirname, '../../assets/lolacc.json');
const LAST_MATCHES_FILE = path.join(__dirname, '../../assets/lastMatches.json');
const RANK_IMAGES_DIR = path.join(__dirname, '../../assets/rank');

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

async function getSummonerProfile(puuid) {
    try {
        const url = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${LOL_API_KEY}`;
        const profileData = await makeRequest(url);
        return profileData;
    } catch (err) {
        throw new Error(`Erreur profil: ${err.message}`);
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
                    lp: rankedData.leaguePoints,
                    wins: rankedData.wins,
                    losses: rankedData.losses
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

function getAccountByDiscordId(discordId) {
    if (!fs.existsSync(ACCOUNTS_FILE)) {
        return null;
    }
    const accounts = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
    return accounts[discordId] || null;
}

function getTierImagePath(tier) {
    const tierMap = {
        'IRON': 'iron.png',
        'BRONZE': 'bronze.png',
        'SILVER': 'silver.png',
        'GOLD': 'gold.png',
        'PLATINUM': 'platinium.png',
        'DIAMOND': 'diamonds.png',
        'MASTER': 'master.png',
        'GRANDMASTER': 'grandmaster.png',
        'CHALLENGER': 'challenger.png',
        'EMERALD': 'emeralds.png'
    };
    return path.join(RANK_IMAGES_DIR, tierMap[tier] || 'iron.png');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Affiche le profil League of Legends de l\'utilisateur'),
    async execute(interaction) {
        try {
            await interaction.deferReply();

            // Récupérer le compte lié de l'utilisateur
            const account = getAccountByDiscordId(interaction.user.id);
            if (!account) {
                return await interaction.editReply({
                    content: '❌ Aucun compte League of Legends lié! Utilise `/loglolacc` pour en lier un.'
                });
            }

            // Récupérer les infos du profil
            const profileData = await getSummonerProfile(account.puuid);

            // Récupérer les infos de ligue
            const leagueInfo = await getLeagueInfo(account.puuid);

            // Construire l'embed
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`👤 ${account.gameName}#${account.tagLine}`)
                .setDescription(`Profil de ${account.gameName}`)
                .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/16.2.1/img/profileicon/${profileData.profileIconId}.png`)
                .addFields(
                    { name: '📊 Niveau', value: profileData.summonerLevel.toString(), inline: true }
                );

            if (leagueInfo) {
                embed.addFields(
                    { name: '🏅 Rang', value: `${leagueInfo.tier} ${leagueInfo.rank}`, inline: true },
                    { name: '⭐ LP', value: leagueInfo.lp.toString(), inline: true },
                    { name: '📈 Victoires/Défaites', value: `${leagueInfo.wins}W / ${leagueInfo.losses}L`, inline: true }
                );

                // Calculer le winrate
                const total = leagueInfo.wins + leagueInfo.losses;
                const winrate = ((leagueInfo.wins / total) * 100).toFixed(1);
                embed.addFields(
                    { name: '📊 Winrate', value: `${winrate}%`, inline: true }
                );
            } else {
                embed.addFields(
                    { name: '🏅 Rang', value: 'Non classé', inline: true }
                );
            }

            embed.setFooter({ text: `Mis à jour le ${new Date().toLocaleString('fr-FR')}` });

            // Ajouter l'image du rang si disponible
            const files = [];
            if (leagueInfo) {
                const rankImagePath = getTierImagePath(leagueInfo.tier);
                if (fs.existsSync(rankImagePath)) {
                    const attachment = new AttachmentBuilder(rankImagePath, { name: 'rank.png' });
                    embed.setImage('attachment://rank.png');
                    files.push(attachment);
                }
            }

            await interaction.editReply({
                embeds: [embed],
                files: files.length > 0 ? files : undefined
            });
        } catch (err) {
            console.error('[PROFILE] Erreur:', err.message);
            await interaction.editReply({
                content: `❌ Erreur lors de la récupération du profil: ${err.message}`
            });
        }
    }
};
