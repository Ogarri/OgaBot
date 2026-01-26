const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const champions = require("../../assets/champslol.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("getchamp")
        .setDescription("Obtiens les informations d'un champion League of Legends")
        .addStringOption(option =>
            option
                .setName("nom")
                .setDescription("Nom du champion")
                .setRequired(true)
                .setAutocomplete(false)
        )
        .setDMPermission(true)
        .setDefaultMemberPermissions(null),

    async execute(interaction) {
        const champName = interaction.options.getString("nom");

        // Chercher le champion
        const champion = champions.champions.find(
            champ => champ.name.toLowerCase() === champName.toLowerCase()
        );

        if (!champion) {
            return interaction.reply({ 
                content: `❌ Champion **${champName}** non trouvé.`, 
                ephemeral: true 
            });
        }

        // Chercher l'icône du rôle
        const roleIcon = champions.lane.find(lane => lane.name === champion.role);

        // Créer l'embed
        const champEmbed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle(`🎲 ${champion.name}`)
            .setDescription(`Rôle: **${champion.role}**`)
            .addFields({ name: "Catégorie", value: champion.category })
            .setThumbnail(roleIcon?.icon || null)
            .setImage(champion.splash)
            .setFooter({ text: "League of Legends - Champion Info" })
            .setTimestamp();

        await interaction.reply({ embeds: [champEmbed] });
    }
};
