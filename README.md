# OgaBot

Un bot Discord moderne construit avec discord.js v14, intégrant l'API Riot Games pour League of Legends.

## Installation

1. Clonez le repository
2. Installez les dépendances :
```bash
npm install
```

3. Créez un fichier `.env` à la racine du projet :
```
TOKEN=votre_token_discord_ici
LOL_API_KEY=votre_clé_api_riot_ici
```

4. Lancez le bot :
```bash
node main.js
```

## Structure du projet

```
OgaBot/
├── assets/
│   ├── lolacc.json         # Comptes League of Legends liés
│   ├── lastMatches.json    # Derniers matchs détectés
│   ├── champslol.json      # Base de données des champions
│   └── tracks/
│       ├── youtubeDl.js    # Téléchargement YouTube
│       ├── queueManager.js # Gestion de la queue musicale
│       └── downloads/      # Fichiers MP3 téléchargés
├── commands/               # Commandes slash
│   ├── leagueoflegends/
│   │   ├── loglolacc.js      # Lier un compte LOL
│   │   ├── unloglolacc.js    # Délier un compte LOL
│   │   ├── history.js        # Historique des matchs
│   │   ├── followherestart.js # Démarrer la détection
│   │   └── followherestop.js  # Arrêter la détection
│   └── music/
│       ├── join.js         # Rejoindre le salon vocal
│       ├── leave.js        # Quitter le salon vocal
│       ├── play.js         # Jouer une musique YouTube
│       ├── pause.js        # Mettre en pause
│       ├── resume.js       # Reprendre
│       ├── stop.js         # Arrêter
│       ├── skip.js         # Passer à la suivante
│       ├── queue.js        # Afficher la queue
│       └── clearqueue.js   # Vider la queue
├── events/                 # Événements Discord
│   └── client/
│       ├── interactionCreate.js
│       └── ready.js
├── loaders/                # Chargeurs de modules
│   ├── loadCommands.js
│   └── loadEvents.js
├── main.js                 # Point d'entrée
├── README.md               # Ce fichier
└── COMMANDES.md            # Liste détaillée des commandes
```

## Commandes disponibles

Pour la liste complète des commandes, consultez [COMMANDES.md](./COMMANDES.md).

### Catégories

- **Musique** : Lecture YouTube, gestion de la queue
- **League of Legends** : Gestion des comptes et suivi des matchs
- **Utilitaires** : Ping, Status

## Fonctionnalités principales

### Lecteur musical avec YouTube
- Téléchargement automatique de musiques YouTube en MP3
- Système de queue pour écouter plusieurs musiques à la suite
- Contrôle de la lecture (pause, reprise, arrêt, skip)
- Gestion automatique des fichiers téléchargés

### Gestion des comptes League of Legends
- Lier votre compte LOL à Discord
- Délier votre compte
- Consulter l'historique de vos matchs ranked

### Suivi des matchs en temps réel
- Détection automatique des nouveaux matchs ranked
- Notifications en direct dans un canal Discord
- Affichage du champion, résultat, K/D/A et durée

## Développement

### Ajouter une nouvelle commande

1. Créez un fichier dans `commands/<categorie>/`
2. Exportez un objet avec `data` (SlashCommandBuilder) et `execute()`

Exemple :
```javascript
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nomCommande")
        .setDescription("Description"),
    
    async execute(interaction) {
        await interaction.reply("Réponse");
    }
};
```

## Prérequis

- Node.js >= 16.0.0
- discord.js >= 14.0.0
- @discordjs/voice
- youtube-dl-exec
- ffmpeg-static
- @snazzah/davey
- dotenv

## Licence

ISC
