# OgaBot - Commandes

## � Musique

| Commande | Description |
|----------|-------------|
| `/join` | Le bot rejoint votre salon vocal |
| `/play <url>` | Télécharge et joue une musique depuis YouTube |
| `/pause` | Met en pause la lecture |
| `/resume` | Reprend la lecture |
| `/stop` | Arrête la lecture et supprime les fichiers MP3 |
| `/skip` | Passe à la musique suivante |
| `/queue` | Affiche la queue actuelle |
| `/clearqueue` | Vide la queue et supprime tous les fichiers |
| `/leave` | Arrête la lecture, vide la queue et quitte le salon vocal |

### Détails

**`/join`**
- Connecte le bot au salon vocal où vous êtes
- Vous devez être dans un salon vocal

**`/play`**
- Télécharge la musique depuis YouTube en MP3
- Ajoute la musique à la queue si une est déjà en cours de lecture
- Supporte les URLs simples (non les playlists complètes)
- Exemples: `/play https://www.youtube.com/watch?v=dQw4w9WgXcQ`

**`/pause` et `/resume`**
- Mettent en pause/reprennent la lecture de la musique actuelle

**`/stop`**
- Arrête immédiatement la lecture
- Supprime tous les fichiers MP3 du dossier downloads

**`/skip`**
- Passe à la musique suivante dans la queue
- Si aucune musique suivante, arrête la lecture

**`/queue`**
- Affiche la musique en cours de lecture
- Liste les musiques en attente

**`/clearqueue`**
- Vide complètement la queue
- Supprime aussi tous les fichiers MP3

**`/leave`**
- Exécute d'abord `/stop`
- Vide la queue
- Quitte le salon vocal

---

## �🎮 League of Legends

| Commande | Description |
|----------|-------------|
| `/loglolacc <gamename> <tagline>` | Lie votre compte LOL à Discord |
| `/unloglolacc` | Supprime votre compte LOL lié |
| `/refreshpuuid` | Rafraîchit le PUUID de votre compte LOL lié |
| `/history` | Affiche vos 5 derniers matchs ranked |
| `/followherestart` | Détecte les nouveaux matchs (toutes les 2 min) |
| `/followherestop` | Arrête la détection |

### Détails

**`/loglolacc`**
- Lien votre compte LOL avec votre Discord
- Usage: `/loglolacc gamename:Ogarri tagline:4273`

**`/refreshpuuid`**
- Rafraîchit le PUUID associé à votre compte LOL lié
- Utile si vous avez changé votre ID Riot récemment
- Requiert un compte lié

**`/history`**
- Affiche le champion, résultat, K/D/A et durée
- Requiert un compte lié
- Matchs ranked uniquement

**`/followherestart`**
- Vérifie tous les comptes tous les 2 minutes
- Une seule boucle par canal
- Affiche les matchs de tous les utilisateurs du canal

---

## 📊 Autres Commandes

| Commande | Description |
|----------|-------------|
| `/ping` | Affiche la latence du bot |
| `/status` | Affiche l'état du bot (ping, uptime, serveurs) |
