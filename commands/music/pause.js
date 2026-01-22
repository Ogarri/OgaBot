const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Met en pause la musique en cours'),
  
  async execute(interaction) {
    // Récupère la connexion vocale du serveur
    const connection = getVoiceConnection(interaction.guild.id);

    // Vérifier que le bot est connecté à un salon vocal
    if (!connection) {
      return await interaction.reply({
        content: '❌ Je ne suis pas connecté à un salon vocal !',
        ephemeral: true
      });
    }

    try {
      // Récupérer la subscription active (lecteur audio)
      const subscription = connection.state.subscription;

      if (!subscription || !subscription.player) {
        return await interaction.reply({
          content: '❌ Aucune musique en cours de lecture !',
          ephemeral: true
        });
      }

      // Mettre en pause le lecteur audio
      const paused = subscription.player.pause();

      if (paused) {
        await interaction.reply({
          content: '⏸️ Musique mise en pause.'
        });
      } else {
        await interaction.reply({
          content: '❌ Impossible de mettre la musique en pause.',
          ephemeral: true
        });
      }

    } catch (error) {
      console.error('Erreur:', error);
      await interaction.reply({
        content: '❌ Une erreur s\'est produite en essayant de mettre en pause.',
        ephemeral: true
      });
    }
  }
};
