const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { clearQueue } = require('../../assets/tracks/queueManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearqueue')
    .setDescription('Supprime tous les titres de la queue et les fichiers'),
  
  async execute(interaction) {
    try {
      // Étape 1: Vider la queue du serveur
      clearQueue(interaction.guild.id);

      // Étape 2: Supprimer tous les fichiers MP3
      const downloadPath = path.join(__dirname, '../../assets/tracks/downloads');

      if (fs.existsSync(downloadPath)) {
        const files = fs.readdirSync(downloadPath);
        const mp3Files = files.filter(f => f.endsWith('.mp3'));

        mp3Files.forEach(file => {
          const filePath = path.join(downloadPath, file);
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Erreur lors de la suppression de ${file}:`, err);
            }
          });
        });
      }

      await interaction.reply({
        content: '🗑️ Queue vidée et fichiers supprimés !'
      });

    } catch (error) {
      console.error('Erreur lors du vidage de la queue:', error);
      await interaction.reply({
        content: '❌ Une erreur s\'est produite en essayant de vider la queue.',
        ephemeral: true
      });
    }
  }
};
