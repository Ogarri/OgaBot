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
├── assets/
│   └── champslol.json      # Base de données des champions League of Legends
├── commands/               # Commandes slash
│   ├── leagueoflegends/
│   │   ├── champroll.js    # Sélection aléatoire de champion
│   │   └── getchamp.js     # Récupérer les infos d'un champion spécifique
│   └── utils/
│       ├── ping.js         # Latence du bot
│       └── status.js       # Status du bot et des APIs
├── events/                 # Événements Discord
│   └── client/
│       ├── interactionCreate.js    # Gestionnaire d'interactions
│       └── ready.js                # Bot ready event
├── loaders/                # Chargeurs de modules
│   ├── loadCommands.js
│   └── loadEvents.js
├── main.js                 # Point d'entrée du bot
└── README.md
```

## Commandes disponibles

### Commandes League of Legends
#### /champroll
Sélectionne un champion aléatoire parmi tous les champions League of Legends.
- **Paramètres** : `role` (Top, Jungle, Mid, ADC, Support, Random)
- **Affiche** : Nom du champion, rôle, catégorie, icône du rôle, et splash art

#### /getchamp
Obtient les informations détaillées d'un champion spécifique.
- **Paramètres** : `nom` (Nom du champion)
- **Affiche** : Nom du champion, rôle, catégorie, icône du rôle, et splash art

### Commandes Utilitaires
#### /ping
Affiche la latence du bot en millisecondes.

#### /status
Affiche le status du bot (État, Ping, Uptime, Nombre de serveurs, Nombre d'utilisateurs).

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
