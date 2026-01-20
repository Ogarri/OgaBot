const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Donne la latence du bot")
    .setDMPermission(true)
    .setDefaultMemberPermissions(null),

    async execute(interaction) {
        const pingEmbed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("🏓 Ping")
            .addFields(
                { name: "Latence", value: `\`${interaction.client.ws.ping}ms\`` }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [pingEmbed] });
    }
};