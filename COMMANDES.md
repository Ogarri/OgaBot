# OgaBot - Commandes

## 🎮 League of Legends

| Commande | Description |
|----------|-------------|
| `/loglolacc <gamename> <tagline>` | Lie votre compte LOL à Discord |
| `/unloglolacc` | Supprime votre compte LOL lié |
| `/refreshpuuid` | Rafraîchit le PUUID de votre compte LOL lié |
| `/getchamp <champion>` | Affiche les infos d'un champion |
| `/champroll` | Roll aléatoire d'un champion |
| `/history` | Affiche vos 20 derniers matchs tous modes confondus |
| `/historyranked` | Affiche vos matchs classés 5v5 Solo parmi les 20 derniers |
| `/historyflex` | Affiche vos matchs classés 5v5 Flex parmi les 20 derniers |
| `/lolstatus` | Affiche l'état et les infos de votre compte LOL |
| `/followherestart` | Détecte les nouveaux matchs ranked (toutes les 2 min) |
| `/followherestop` | Arrête la détection |

### Détails

**`/loglolacc`**
- Lie votre compte LOL avec votre Discord
- Usage: `/loglolacc gamename:Ogarri tagline:4273`

**`/unloglolacc`**
- Supprime votre compte LOL lié à Discord

**`/refreshpuuid`**
- Rafraîchit le PUUID associé à votre compte LOL lié
- Utile si vous avez changé votre ID Riot récemment
- Requiert un compte lié

**`/getchamp`**
- Affiche les informations d'un champion League of Legends
- Informations disponibles depuis la base de données des champions
- Usage: `/getchamp Ahri`

**`/champroll`**
- Effectue un roll aléatoire d'un champion
- Parfait pour trouver votre champion du jour
- Pas de paramètres nécessaires

**`/history`**
- Affiche les 20 derniers matchs tous modes confondus
- Requiert un compte lié
- Affiche le champion, résultat, K/D/A, dégâts, or et CS

**`/historyranked`**
- Affiche vos matchs classés 5v5 Solo parmi les 20 derniers
- Filtre pour n'afficher que les matchs Ranked Solo (queueId 420)
- Requiert un compte lié
- Message si aucun match classé trouvé dans les 20 derniers

**`/historyflex`**
- Affiche vos matchs classés 5v5 Flex parmi les 20 derniers
- Filtre pour n'afficher que les matchs Ranked Flex (queueId 440)
- Requiert un compte lié
- Message si aucun match Flex trouvé dans les 20 derniers

**`/lolstatus`**
- Affiche l'état et les informations de votre compte LOL lié
- Requiert un compte lié
- Informations: niveau du compte, ligue actuelle, points de ranked

**`/followherestart`**
- Vérifie tous les comptes tous les 2 minutes
- Une seule boucle par canal
- Affiche les nouveaux matchs ranked de tous les utilisateurs du canal
- Affiche le champion, résultat, K/D/A, LP et durée

**`/followherestop`**
- Arrête la détection des matchs dans le canal courant

---

## 📊 Utilitaires

| Commande | Description |
|----------|-------------|
| `/ping` | Affiche la latence du bot |
| `/status` | Affiche l'état du bot (ping, uptime, serveurs) |

### Détails

**`/ping`**
- Affiche la latence actuelle du bot envers Discord
- Utile pour vérifier la stabilité de la connexion

**`/status`**
- Affiche les informations complètes du bot
- Ping vers Discord
- Uptime du bot
- Nombre de serveurs où le bot est présent
