const { Events, ActivityType } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    async run(client) {
        await client.application.commands.set(client.commands.map(command => command.data));
        console.log("[Interactions] => chargés.");
        client.user.setActivity("Kai'Sa Feet Eater", { type: ActivityType.Playing });
        console.log(`[Bot] => ${client.user.username} est en ligne.`);
    }
}