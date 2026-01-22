const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { clearQueue } = require('../../assets/tracks/queueManager');
const stopCommand = require('./stop');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Arrête la lecture et quitte le salon vocal'),
  
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
      // Étape 1: Exécuter la commande /stop
      await stopCommand.execute(interaction);

      // Étape 2: Attendre que /stop soit terminée (délai pour que les fichiers soient supprimés)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Étape 3: Vider la queue
      clearQueue(interaction.guild.id);

      // Étape 4: Quitter le salon vocal
      connection.destroy();

    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      await interaction.reply({
        content: '❌ Une erreur s\'est produite en essayant de quitter le salon vocal.',
        ephemeral: true
      });
    }
  }
};
