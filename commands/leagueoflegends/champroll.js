const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const champions = require("../../assets/champslol.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("champroll")
        .setDescription("Obtiens un champion aléatoire de League of Legends")
        .addStringOption(option =>
            option
                .setName("role")
                .setDescription("Sélectionne un rôle")
                .setRequired(true)
                .addChoices(
                    { name: "Top", value: "Top" },
                    { name: "Jungle", value: "Jungle" },
                    { name: "Mid", value: "Mid" },
                    { name: "ADC", value: "ADC" },
                    { name: "Support", value: "Support" },
                    { name: "Random", value: "Random" }
                )
        )
        .setDMPermission(true)
        .setDefaultMemberPermissions(null),

    async run(interaction) {
        const selectedRole = interaction.options.getString("role");
        
        // Filtrer les champions par rôle
        let filteredChampions = champions.champions;
        
        if (selectedRole !== "Random") {
            filteredChampions = champions.champions.filter(champ => champ.role === selectedRole);
        }

        // Sélectionner un champion aléatoire
        const randomChampion = filteredChampions[Math.floor(Math.random() * filteredChampions.length)];

        // Chercher l'icône du rôle
        const roleIcon = champions.lane.find(lane => lane.name === randomChampion.role);

        // Créer l'embed
        const champEmbed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle(`🎲 ${randomChampion.name}`)
            .setDescription(`Rôle: **${randomChampion.role}**`)
            .addFields({ name: "Catégorie", value: randomChampion.category })
            .setThumbnail(roleIcon?.icon || null)
            .setImage(randomChampion.splash)
            .setFooter({ text: "League of Legends - Champion Roll" })
            .setTimestamp();

        await interaction.reply({ embeds: [champEmbed] });
    }
};

