const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lolstatus")
        .setDescription("Vérifie l'état des serveurs League of Legends")
        .addStringOption(option =>
            option
                .setName("region")
                .setDescription("Région (na1, euw1, kr, etc.)")
                .setRequired(false)
                .setChoices(
                    { name: "NA (Americas)", value: "na1" },
                    { name: "EUW (Europe West)", value: "euw1" },
                    { name: "EUNE (Europe Nordic & East)", value: "eun1" },
                    { name: "Korea", value: "kr" },
                    { name: "Brazil", value: "br1" },
                    { name: "Japan", value: "jp1" },
                    { name: "Russia", value: "ru" },
                    { name: "Turkey", value: "tr1" },
                    { name: "OCE", value: "oc1" },
                    { name: "Latin America South", value: "la2" },
                    { name: "Latin America North", value: "la1" }
                )
        )
        .setDMPermission(true)
        .setDefaultMemberPermissions(null),

    async execute(interaction) {
        await interaction.deferReply();

        const region = interaction.options.getString("region") || "euw1";
        const apiKey = process.env.LOL_API_KEY;

        if (!apiKey) {
            return interaction.editReply({
                content: "❌ Clé API Riot Games non configurée.",
                flags: 64
            });
        }

        try {
            const response = await axios.get(
                `https://${region}.api.riotgames.com/lol/status/v4/platform-data`,
                {
                    headers: {
                        "X-Riot-Token": apiKey
                    }
                }
            );

            const data = response.data;

            // Créer l'embed
            const statusEmbed = new EmbedBuilder()
                .setColor("#0099ff")
                .setTitle(`📊 Statut des serveurs - ${region.toUpperCase()}`)
                .setDescription(`ID Plateforme: **${data.id}**`)
                .addFields(
                    {
                        name: "🌐 Domaines",
                        value: (data.domains && data.domains.length > 0) ? data.domains.join(", ") : "N/A",
                        inline: false
                    }
                );

            // Ajouter les incidents s'il y en a
            if (data.incidents && data.incidents.length > 0) {
                statusEmbed.setColor("#ff0000");
                const incidents = data.incidents
                    .map(incident => `⚠️ **${incident.title}** - Statut: ${incident.status}`)
                    .join("\n");
                statusEmbed.addFields({
                    name: "🚨 Incidents",
                    value: incidents,
                    inline: false
                });
            } else {
                statusEmbed.addFields({
                    name: "✅ Incidents",
                    value: "Aucun incident détecté",
                    inline: false
                });
            }

            // Ajouter les maintenances s'il y en a
            if (data.maintenances && data.maintenances.length > 0) {
                const maintenances = data.maintenances
                    .map(maintenance => {
                        const startTime = new Date(maintenance.start_time).toLocaleString("fr-FR");
                        const endTime = new Date(maintenance.end_time).toLocaleString("fr-FR");
                        return `🔧 **${maintenance.title}**\nDe ${startTime} à ${endTime}\nStatut: ${maintenance.status}`;
                    })
                    .join("\n\n");
                statusEmbed.addFields({
                    name: "🔨 Maintenances",
                    value: maintenances,
                    inline: false
                });
            } else {
                statusEmbed.addFields({
                    name: "🔨 Maintenances",
                    value: "Aucune maintenance programmée",
                    inline: false
                });
            }

            statusEmbed
                .setFooter({ text: "League of Legends - Platform Status" })
                .setTimestamp();

            await interaction.editReply({ embeds: [statusEmbed] });

        } catch (error) {
            console.error("Erreur lors de la récupération du statut:", error.message);

            const errorMessage = error.response?.status === 403
                ? "❌ Clé API invalide ou expirée."
                : error.response?.status === 404
                ? "❌ Région non trouvée."
                : `❌ Erreur: ${error.message}`;

            await interaction.editReply({
                content: errorMessage,
                flags: 64
            });
        }
    }
};
