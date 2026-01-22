const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Reprend la lecture de la musique'),
  
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
          content: '❌ Aucune musique en pause !',
          ephemeral: true
        });
      }

      // Reprendre le lecteur audio
      const unpaused = subscription.player.unpause();

      if (unpaused) {
        await interaction.reply({
          content: '▶️ Lecture reprise.'
        });
      } else {
        await interaction.reply({
          content: '❌ Impossible de reprendre la lecture.',
          ephemeral: true
        });
      }

    } catch (error) {
      console.error('Erreur:', error);
      await interaction.reply({
        content: '❌ Une erreur s\'est produite en essayant de reprendre la lecture.',
        ephemeral: true
      });
    }
  }
};
