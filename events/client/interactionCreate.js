const { Events, InteractionType } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,
    async run(client, interaction) {
        if (interaction.type === InteractionType.ApplicationCommand) {
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '✗ Erreur lors de l\'exécution de la commande.', ephemeral: true });
            }
        };
    }
};