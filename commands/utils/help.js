const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Affiche la liste des commandes disponibles")
        .setDMPermission(true)
        .setDefaultMemberPermissions(null),

    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor("#9c27b0")
            .setTitle("📚 Aide - Commandes OgaBot")
            .addFields(
                {
                    name: "🎮 League of Legends",
                    value: `
\`/loglolacc\` - Lie votre compte LOL à Discord
\`/unloglolacc\` - Supprime votre compte LOL lié
\`/refreshpuuid\` - Rafraîchit le PUUID de votre compte
\`/getchamp\` - Affiche les infos d'un champion
\`/champroll\` - Roll aléatoire d'un champion
\`/history\` - Affiche vos 20 derniers matchs
\`/historyranked\` - Affiche vos matchs classés Solo
\`/historyflex\` - Affiche vos matchs classés Flex
\`/lolstatus\` - Affiche l'état de votre compte LOL
\`/followherestart\` - Détecte les nouveaux matchs ranked
\`/followherestop\` - Arrête la détection
                    `,
                    inline: false
                },
                {
                    name: "📊 Utilitaires",
                    value: `
\`/ping\` - Affiche la latence du bot
\`/status\` - Affiche l'état du bot
\`/help\` - Affiche cette page
                    `,
                    inline: false
                }
            )
            .setFooter({ text: "Utilisez /commande pour plus de détails" })
            .setTimestamp();

        await interaction.reply({ embeds: [helpEmbed] });
    }
};
