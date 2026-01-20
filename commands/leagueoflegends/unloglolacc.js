const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');

const ACCOUNTS_FILE = path.join(__dirname, '../../assets/lolacc.json');

function removeAccount(discordId) {
    if (!fs.existsSync(ACCOUNTS_FILE)) {
        throw new Error('Aucun compte enregistré');
    }
    
    const data = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
    let accounts = JSON.parse(data);
    
    if (!accounts[discordId]) {
        throw new Error('Votre compte LOL n\'est pas enregistré');
    }
    
    const gameName = accounts[discordId].gameName;
    delete accounts[discordId];
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
    
    return gameName;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unloglolacc')
        .setDescription('Supprime votre compte League of Legends lié'),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const gameName = removeAccount(interaction.user.id);
            console.log(`[LOL] ${interaction.user.username} (${interaction.user.id}) s'est déconnecté de ${gameName}`);
            
            await interaction.editReply('✓ Compte supprimé avec succès!');
        } catch (err) {
            await interaction.editReply(`✗ Erreur: ${err.message}`);
        }
    }
};
