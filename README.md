# OgaBot

Un bot Discord moderne construit avec discord.js v14.

## Installation

1. Clonez le repository
2. Installez les dépendances :
```bash
npm install
```

3. Créez un fichier `.env` à la racine du projet :
```
TOKEN=votre_token_discord_ici
```

4. Lancez le bot :
```bash
node main.js
```

## Structure du projet

```
OgaBot/
├── commands/          # Commandes slash
│   └── utils/
│       └── ping.js
├── events/            # Événements Discord
│   └── bot/
│       └── ready.js
├── interaction/       # Gestionnaires d'interactions
│   └── interactionCreate.js
├── loaders/           # Chargeurs de modules
│   ├── loadCommands.js
│   └── loadEvents.js
├── main.js            # Point d'entrée du bot
└── README.md
```

## Commandes disponibles

### /ping
Affiche la latence du bot en millisecondes.

## Développement

### Ajouter une nouvelle commande

1. Créez un fichier dans `commands/<categorie>/`
2. Exportez un objet avec `data` (SlashCommandBuilder) et `run()` (fonction asynchrone)

Exemple :
```javascript
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nomCommande")
        .setDescription("Description"),
    
    async run(interaction) {
        await interaction.reply("Réponse");
    }
};
```

### Ajouter un nouvel événement

1. Créez un fichier dans `events/<categorie>/`
2. Exportez un objet avec `name` (Event name) et `run()` (fonction asynchrone)

Exemple :
```javascript
const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageCreate,
    async run(client, message) {
        // Votre code ici
    }
};
```

## Prérequis

- Node.js >= 16.0.0
- discord.js >= 14.0.0
- dotenv

## Licence

ISC
