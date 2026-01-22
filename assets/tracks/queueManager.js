// Gestion globale des queues par serveur
const queues = new Map();

/**
 * Obtient ou crée la queue d'un serveur
 * @param {string} guildId - ID du serveur
 * @returns {Object} La queue du serveur
 */
function getQueue(guildId) {
  if (!queues.has(guildId)) {
    queues.set(guildId, {
      songs: [],
      isPlaying: false,
      currentPlayer: null,
      currentSubscription: null
    });
  }
  return queues.get(guildId);
}

/**
 * Ajoute une musique à la queue
 * @param {string} guildId - ID du serveur
 * @param {Object} song - Objet musique { title, filePath }
 */
function addToQueue(guildId, song) {
  const queue = getQueue(guildId);
  queue.songs.push(song);
}

/**
 * Récupère la première musique et la retire de la queue
 * @param {string} guildId - ID du serveur
 * @returns {Object|null} La musique ou null si la queue est vide
 */
function getNextSong(guildId) {
  const queue = getQueue(guildId);
  return queue.songs.length > 0 ? queue.songs.shift() : null;
}

/**
 * Obtient toutes les musiques de la queue sans les retirer
 * @param {string} guildId - ID du serveur
 * @returns {Array} Les musiques en queue
 */
function viewQueue(guildId) {
  const queue = getQueue(guildId);
  return queue.songs;
}

/**
 * Définit le lecteur et la subscription actuels
 * @param {string} guildId - ID du serveur
 * @param {Object} player - Le lecteur audio
 * @param {Object} subscription - La subscription
 */
function setCurrentPlayback(guildId, player, subscription) {
  const queue = getQueue(guildId);
  queue.currentPlayer = player;
  queue.currentSubscription = subscription;
  queue.isPlaying = true;
}

/**
 * Marque la fin de la lecture
 * @param {string} guildId - ID du serveur
 */
function stopPlayback(guildId) {
  const queue = getQueue(guildId);
  queue.isPlaying = false;
  queue.currentPlayer = null;
  queue.currentSubscription = null;
}

/**
 * Vide la queue
 * @param {string} guildId - ID du serveur
 */
function clearQueue(guildId) {
  const queue = getQueue(guildId);
  queue.songs = [];
  queue.isPlaying = false;
  queue.currentPlayer = null;
  queue.currentSubscription = null;
}

/**
 * Obtient l'état de la queue
 * @param {string} guildId - ID du serveur
 * @returns {Object} L'état complet de la queue
 */
function getQueueInfo(guildId) {
  return getQueue(guildId);
}

module.exports = {
  getQueue,
  addToQueue,
  getNextSong,
  viewQueue,
  setCurrentPlayback,
  stopPlayback,
  clearQueue,
  getQueueInfo
};
