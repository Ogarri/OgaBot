const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { addToQueue, getNextSong, setCurrentPlayback, stopPlayback, viewQueue } = require('../../assets/tracks/queueManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Joue une vidéo YouTube en MP3 dans le salon vocal')
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription('L\'URL YouTube à télécharger et jouer')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    // Récupère la connexion vocale du serveur
    const connection = getVoiceConnection(interaction.guild.id);

    // Vérifier que le bot est connecté à un salon vocal
    if (!connection) {
      return await interaction.reply({
        content: '❌ Je ne suis pas connecté à un salon vocal ! Utilise `/join` avant.',
        ephemeral: true
      });
    }

    const url = interaction.options.getString('url');
    const downloadPath = path.join(__dirname, '../../assets/tracks/downloads');

    try {
      await interaction.deferReply();

      // Créer le dossier de téléchargement s'il n'existe pas
      if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true });
      }

      await interaction.editReply({
        content: '⏳ Téléchargement en cours...'
      });

      // Exécuter youtubeDl.js
      await downloadYouTubeMp3(url, downloadPath);

      await interaction.editReply({
        content: '✅ Téléchargement terminé ! Ajout à la queue...'
      });

      // Récupérer le fichier MP3 téléchargé
      const files = fs.readdirSync(downloadPath);
      const mp3Files = files.filter(f => f.endsWith('.mp3'));

      if (mp3Files.length === 0) {
        return await interaction.editReply({
          content: '❌ Aucun fichier MP3 n\'a pu être téléchargé.'
        });
      }

      // Prendre le dernier fichier MP3 téléchargé
      const mp3File = mp3Files[mp3Files.length - 1];
      const filePath = path.join(downloadPath, mp3File);

      // Vérifier s'il y a déjà de la musique qui joue
      const connection_check = getVoiceConnection(interaction.guild.id);
      const subscription = connection_check?.state.subscription;

      if (subscription && subscription.player) {
        // Il y a déjà de la musique qui joue, ajouter à la queue
        addToQueue(interaction.guild.id, {
          title: mp3File,
          filePath: filePath
        });
        
        const queue = viewQueue(interaction.guild.id);
        await interaction.editReply({
          content: `✅ **${mp3File}** ajouté à la queue (Position: ${queue.length})`
        });
      } else {
        // C'est la première musique, la jouer directement sans l'ajouter à la queue
        await playSong(interaction, connection, mp3File, filePath, downloadPath);
      }

    } catch (error) {
      console.error('Erreur:', error);
      await interaction.editReply({
        content: '❌ Une erreur s\'est produite lors de la lecture.'
      });
    }
  }
};

// Fonction pour télécharger via youtubeDl.js
function downloadYouTubeMp3(url, outputPath) {
  return new Promise((resolve, reject) => {
    const youtubeDlScript = path.join(__dirname, '../../assets/tracks/youtubeDl.js');
    
    const child = spawn('node', [youtubeDlScript, url, outputPath]);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`youtubeDl.js s'est terminé avec le code ${code}\n${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Fonction pour jouer une musique
async function playSong(interaction, connection, mp3File, filePath, downloadPath) {
  try {
    // Créer une ressource audio
    const resource = createAudioResource(filePath);

    // Créer un lecteur audio
    const player = createAudioPlayer();

    // Jouer la ressource
    player.play(resource);

    // Ajouter le lecteur à la connexion
    const subscription = connection.subscribe(player);

    if (!subscription) {
      throw new Error('Impossible d\'ajouter le lecteur audio');
    }

    // Sauvegarder le lecteur et la subscription dans la queue
    setCurrentPlayback(interaction.guild.id, player, subscription);

    await interaction.editReply({
      content: `▶️ Lecture en cours: **${mp3File}**`
    });

    // Attendre la fin de la lecture
    return new Promise((resolve) => {
      player.on(AudioPlayerStatus.Idle, async () => {
        // Arrêter et nettoyer le lecteur
        try {
          player.stop();
          subscription.unsubscribe();
          resource.playStream?.destroy();
        } catch (e) {
          console.error('Erreur lors du nettoyage:', e);
        }

        // Supprime le fichier après la lecture (avec délai pour libérer complètement les ressources)
        setTimeout(() => {
          fs.unlink(filePath, (err) => {
            if (err) {
              // Réessayer après 3 secondes si le fichier est occupé
              if (err.code === 'EBUSY') {
                setTimeout(() => {
                  fs.unlink(filePath, (retryErr) => {
                    // Silencieux
                  });
                }, 3000);
              }
            }
          });
        }, 5000);

        // Vérifier s'il y a une prochaine musique dans la queue
        const connection = getVoiceConnection(interaction.guild.id);
        const nextSong = getNextSong(interaction.guild.id);

        if (nextSong && connection) {
          // Jouer la prochaine musique
          await playSong(interaction, connection, nextSong.title, nextSong.filePath, downloadPath);
        } else {
          // Fin de la queue
          stopPlayback(interaction.guild.id);
        }

        resolve();
      });

      // Gérer les erreurs
      player.on('error', (error) => {
        console.error('Erreur du lecteur audio:', error);
        stopPlayback(interaction.guild.id);
        resolve();
      });

      // Timeout de 15 minutes
      setTimeout(resolve, 900000);
    });
  } catch (error) {
    console.error('Erreur:', error);
    stopPlayback(interaction.guild.id);
    throw error;
  }
}
