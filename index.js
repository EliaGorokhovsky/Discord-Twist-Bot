

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
        if (message.content.startsWith("!twisthelp")) 
        {
            await twistJuryChannel.send("Welcome to Tornado Twister! Here is what I can do:\n!twist {victim} [{challenge}] \n   to assign a new twist; \n!challenge {participants} [{challenge}] \n    to assign a new challenge; \n!twisthelp \n   to see this message again.");
        }
        //!twist calls a new twist
        else if (message.content.startsWith("!twist"))
        {
            let errMessage = "";
            if (message.mentions.members.size != 1) 
            {
                errMessage += `Please only assign twists exactly one person at a time. (Your message includes ${message.mentions.members.size} people.)\n`
            } 
            if (!(message.content.includes("[") && message.content.includes("]"))) 
            {
                errMessage += "Please include a twist delimited by [...].\n"
            }
            if (errMessage == "")
            {
                let twist = message.content.substring(message.content.indexOf("[") + 1, message.content.lastIndexOf("]"));
                let reply = await twistJuryChannel.send(`New twist for ${message.mentions.members.map(a => a.toString())}: ${twist}`);
                await reply.pin();
            }
            else 
            {
                await twistJuryChannel.send(errMessage.replace(/\n$/, "")) 
            }
            err = false;
        }
        else if (message.content.startsWith("!challenge")) 
        {
            if (message.mentions.size < 1) 
            {
                await twistJuryChannel.send("Please only assign challenges to at least one person.");
            }
            else 
            {
                let challenge = message.content.replace("!challenge", "");
                for (i = 0; i < message.mentions.members.size; i++) 
                {
                    challenge = challenge.replace(message.mentions.members.map(a => a.toString())[i], "");
                }
                let reply = await twistJuryChannel.send(`New challenge for ${message.mentions.members.map(a => a.toString())}: ${challenge}`);
                await reply.pin();
            }
        }
    });

});
