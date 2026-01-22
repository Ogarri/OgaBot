const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Arrête la lecture et supprime les fichiers MP3'),
  
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

      if (subscription) {
        // Arrêter le lecteur audio
        subscription.player.stop();
      }

      // Supprimer les fichiers MP3 du dossier downloads
      const downloadPath = path.join(__dirname, '../../assets/tracks/downloads');

      if (fs.existsSync(downloadPath)) {
        const files = fs.readdirSync(downloadPath);
        const mp3Files = files.filter(f => f.endsWith('.mp3'));

        mp3Files.forEach(file => {
          const filePath = path.join(downloadPath, file);
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Erreur lors de la suppression de ${file}:`, err);
            } else {
              console.log(`📁 Fichier supprimé: ${file}`);
            }
          });
        });
      }

      await interaction.reply({
        content: '⏹️ Lecture arrêtée et fichiers MP3 supprimés !'
      });

    } catch (error) {
      console.error('Erreur:', error);
      await interaction.reply({
        content: '❌ Une erreur s\'est produite en essayant d\'arrêter la lecture.',
        ephemeral: true
      });
    }
  }
};
