const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { viewQueue, getQueueInfo } = require('../../assets/tracks/queueManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Affiche la queue des musiques en attente'),
  
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
      const queue = viewQueue(interaction.guild.id);
      const queueInfo = getQueueInfo(interaction.guild.id);

      // Créer un message avec la liste des musiques
      let queueMessage = '📋 **Queue actuelle:**\n\n';
      
      // Afficher la musique en cours de lecture
      if (queueInfo.isPlaying) {
        queueMessage += '▶️ **En cours de lecture:**\n';
        queueMessage += `   *Musique en cours*\n\n`;
      }

      // Vérifier s'il y a de la musique dans la queue
      if (queue.length === 0) {
        if (queueInfo.isPlaying) {
          await interaction.reply({
            content: queueMessage + '**Prochaines musiques:** Aucune'
          });
        } else {
          return await interaction.reply({
            content: '❌ La queue est vide !',
            ephemeral: true
          });
        }
      } else {
        queueMessage += '**Prochaines musiques:**\n';
        queue.forEach((song, index) => {
          queueMessage += `${index + 1}. **${song.title}**\n`;
        });

        await interaction.reply({
          content: queueMessage
        });
      }

    } catch (error) {
      console.error('Erreur:', error);
      await interaction.reply({
        content: '❌ Une erreur s\'est produite en essayant d\'afficher la queue.',
        ephemeral: true
      });
    }
  }
};
