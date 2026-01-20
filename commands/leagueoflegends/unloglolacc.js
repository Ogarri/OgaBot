const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✓ Compte supprimé')
                .addFields(
                    { name: '👤 Compte supprimé', value: gameName, inline: false }
                )
                .setFooter({ text: interaction.user.username })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('✗ Erreur')
                .setDescription(err.message)
                .setFooter({ text: interaction.user.username })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
