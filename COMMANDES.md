# Liste des Commandes OgaBot

## League of Legends

### /loglolacc
**Description** : Lie votre compte League of Legends à Discord

**Paramètres** :
- `gamename` (texte, obligatoire) : Votre nom d'invocateur
- `tagline` (texte, obligatoire) : Votre tag (#XXXX)

**Exemple** : `/loglolacc gamename:Ogarri tagline:4273`

**Réponse** : Confirme le lien avec votre pseudo LOL

---

### /unloglolacc
**Description** : Supprime votre compte League of Legends lié à Discord

**Paramètres** : Aucun

**Exemple** : `/unloglolacc`

**Réponse** : Confirme la suppression de votre compte

---

### /history
**Description** : Affiche l'historique de vos 5 derniers matchs ranked

**Paramètres** : Aucun

**Exemple** : `/history`

**Affichage** :
```
Historique de GameName#TAG (X matchs)

1. Champion | Résultat | K/D/A | Durée
2. Champion | Résultat | K/D/A | Durée
...
```

**Notes** :
- Requiert un compte lié avec `/loglolacc`
- Affiche uniquement les matchs ranked
- Les informations incluent le champion joué, le résultat (victoire/défaite), K/D/A et la durée

---

### /followherestart
**Description** : Démarre la détection automatique des nouveaux matchs ranked

**Paramètres** : Aucun

**Exemple** : `/followherestart`

**Comportement** :
- Vérifie tous les comptes liés toutes les 2 minutes
- Envoie une notification dans le canal quand un nouveau match ranked est détecté
- Affiche le champion, le résultat, K/D/A, la durée et le timestamp du match

**Notes** :
- Une seule boucle par canal
- La première vérification est immédiate
- Affiche les matchs de **tous les utilisateurs** avec un compte lié

---

### /followherestop
**Description** : Arrête la détection des nouveaux matchs dans le canal

**Paramètres** : Aucun

**Exemple** : `/followherestop`

**Réponse** : Confirme l'arrêt du suivi

**Notes** :
- Arrête uniquement la boucle du canal courant
- Retourne une erreur si aucune boucle n'est active

---

## Informations supplémentaires

### Format des notifications de matchs
```
GameName#TAG vient de terminer un match!
```
Champion: ChampionName
Résultat: ✓ Victoire ou ✗ Défaite
K/D/A: X/Y/Z
Durée: XXm
Match ID: match_id
Timestamp: JJ/MM/YYYY HH:mm:ss
```
```

### Stockage des données

- **lolacc.json** : Stocke les comptes LOL liés (gameName, tagLine, puuid)
- **lastMatches.json** : Stocke les derniers matchs détectés par utilisateur

### Logs

Le bot affiche des logs pour :
- ✅ Connexion d'un utilisateur : `[LOL] Username (ID) s'est connecté avec GameName#TAG`
- ❌ Déconnexion d'un utilisateur : `[LOL] Username (ID) s'est déconnecté de GameName`
- 🔄 Itération de suivi : `[FOLLOWHERE] Vérification des matchs pour le canal ...`
- 🆕 Nouveau match : `[FOLLOWHERE] Nouveau match détecté pour GameName#TAG`
- ⏹️ Arrêt du suivi : `[FOLLOWHERE] Arrêt de la boucle pour le canal ...`
