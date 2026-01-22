const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { getNextSong } = require('../../assets/tracks/queueManager');
const { viewQueue, setCurrentPlayback, stopPlayback } = require('../../assets/tracks/queueManager');
const fs = require('fs');
const path = require('path');
const { createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Passe à la musique suivante dans la queue'),
  
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

      // Arrêter le lecteur audio
      subscription.player.stop();

      await interaction.reply({
        content: '⏭️ Musique passée. Lecture suivante en cours...'
      });

    } catch (error) {
      console.error('Erreur:', error);
      await interaction.reply({
        content: '❌ Une erreur s\'est produite en essayant de passer à la musique suivante.',
        ephemeral: true
      });
    }
  }
};
