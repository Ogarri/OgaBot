const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Le bot rejoint le salon vocal'),
  
  async execute(interaction) {
    // Récupère le membre qui a tapé la commande
    const member = interaction.member;
    
    // Vérifier que le membre est connecté à un salon vocal
    if (!member.voice.channel) {
      return await interaction.reply({
        content: '❌ Tu dois être dans un salon vocal pour que je te rejoigne !',
        ephemeral: true
      });
    }

    try {
      // Le bot rejoint le salon vocal
      const connection = joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      await interaction.reply({
        content: `✅ Je suis rejoint le salon vocal **${member.voice.channel.name}** !`,
      });
    } catch (error) {
      console.error('Erreur lors de la connexion au salon vocal:', error);
      await interaction.reply({
        content: '❌ Une erreur s\'est produite en essayant de rejoindre le salon vocal.',
        ephemeral: true
      });
    }
  }
};
