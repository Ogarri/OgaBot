const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Status du bot et des API")
    .setDMPermission(true)
    .setDefaultMemberPermissions(null),

    async run(interaction) {
        const client = interaction.client;
        const uptime = Math.floor(client.uptime / 1000);
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;

        const statusEmbed = new EmbedBuilder()
            .setColor("#00ff00")
            .setTitle("📊 Status du Bot")
            .addFields(
                { name: "État", value: "🟢 En ligne", inline: true },
                { name: "Ping", value: `\`${client.ws.ping}ms\``, inline: true },
                { name: "Uptime", value: `${days}j ${hours}h ${minutes}m ${seconds}s`, inline: true },
                { name: "Serveurs", value: `\`${client.guilds.cache.size}\``, inline: true },
                { name: "Utilisateurs", value: `\`${client.users.cache.size}\``, inline: true }
            )
            .setFooter({ text: "Bot Status" })
            .setTimestamp();

        await interaction.reply({ embeds: [statusEmbed] });
    }
}