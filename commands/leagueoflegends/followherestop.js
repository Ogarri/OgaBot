const { SlashCommandBuilder } = require('discord.js');
const followhere = require('./followherestart');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('followherestop')
        .setDescription('Arrête la détection des nouvelles parties'),
    async execute(interaction) {
        const channelId = interaction.channelId;
        const activeLoops = followhere.getActiveLoops();
        
        if (!activeLoops.has(channelId)) {
            return await interaction.reply({ 
                content: '⚠️ Aucune boucle active dans ce canal!',
                ephemeral: true 
            });
        }

        const intervalId = activeLoops.get(channelId);
        clearInterval(intervalId);
        activeLoops.delete(channelId);
        
        console.log(`[FOLLOWHERE] Arrêt de la boucle pour le canal ${interaction.channel.name} (${channelId}) par ${interaction.user.username}`);

        await interaction.reply('⏹️ Suivi des matchs arrêté!');
    }
};
