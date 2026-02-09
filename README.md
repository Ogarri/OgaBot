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

## Dépendances

- **discord.js** (^14.25.1) : Framework Discord
- **dotenv** (^17.2.3) : Gestion des variables d'environnement
- **axios** (^1.13.3) : Client HTTP pour les requêtes API

## Structure du projet

```
OgaBot/
├── assets/
│   ├── lolacc.json         # Comptes League of Legends liés
│   ├── lastMatches.json    # Derniers matchs détectés
│   └── champslol.json      # Base de données des champions
├── commands/               # Commandes slash
│   ├── leagueoflegends/
│   │   ├── loglolacc.js        # Lier un compte LOL
│   │   ├── unloglolacc.js      # Délier un compte LOL
│   │   ├── history.js          # Historique de tous les matchs
│   │   ├── historyranked.js    # Historique des matchs Ranked Solo
│   │   ├── historyflex.js      # Historique des matchs Ranked Flex
│   │   ├── champroll.js        # Roll aléatoire de champion
│   │   ├── getchamp.js         # Informations sur un champion
│   │   ├── refreshpuuid.js     # Rafraîchir le PUUID
│   │   ├── followherestart.js  # Démarrer la détection
│   │   └── followherestop.js   # Arrêter la détection
│   └── utils/
│       ├── ping.js         # Latence du bot
│       ├── status.js       # État du bot
│       └── help.js         # Aide et liste des commandes
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

- **League of Legends** : Gestion des comptes, suivi des matchs, infos champions
- **Utilitaires** : Aide, Ping, Status

## Fonctionnalités principales

### Gestion des comptes League of Legends
- Lier votre compte LOL à Discord
- Délier votre compte
- Consulter l'historique de vos 5 derniers matchs ranked
- Informations détaillées sur les champions
- Roll aléatoire de champion

### Suivi des matchs en temps réel
- Détection automatique des nouveaux matchs ranked
- Notifications en direct dans un canal Discord
- Affichage du champion, résultat, K/D/A, LP et durée

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

## Licence

ISC
