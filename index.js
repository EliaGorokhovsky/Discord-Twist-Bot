

const Discord = require("discord.js");
const pg = require("pg");

const client = new Discord.Client();
let databaseClient;

//If environment variables aren't already available, load them from file
if (process.env.PORT == undefined) {
    require("dotenv").load()
} else { //If environment variables are already available, then Heroku is being used
    databaseClient = new pg.Client({connectionString: process.env.DATABASE_URL});
}

//Logs the client in
client.login(`${process.env.DiscordKey}`);
client.on('ready', () => {

    //How the bot responds to a message being sent
    client.on('message', async message => {
        //TODO:
        let twistJuryChannel = client.channels.array().find(channel => channel.id === process.env.twistjuryChannelID);
        //!twist calls a new twist
        if (message.content.includes("!twist"))
        {
            let reply = await twistJuryChannel.send(`Acknowledged twist for ${message.mentions.members.map(a => a.toString())}: ${message.content.replace("!twist", "").replace(message.mentions.members.map(a => a.toString()), "")}`);
            await reply.pin();
        }
    });

});
