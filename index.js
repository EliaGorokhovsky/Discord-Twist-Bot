

const Discord = require("discord.js");
const pg = require("pg");

const client = new Discord.Client();
let databaseClient;

//Thumbs up
const affirmationEmoji = "👍"

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
            //Semantic errors:
            let errMessage = "";
            if (message.mentions.members.size != 1) 
            {
                errMessage += `Please only assign twists exactly one person at a time. (Your message includes ${message.mentions.members.length} people.)\n`
            } 
            if (!(message.content.includes("[") && message.content.includes("]"))) 
            {
                errMessage += "Please include a twist delimited by [...].\n";
            }
            //If there are no errors, proceed
            if (errMessage == "")
            {
                let twist = message.content.substring(message.content.indexOf("[") + 1, message.content.lastIndexOf("]"));
                let replyContent = `New twist for ${message.mentions.members.map(a => a.toString())}: ${twist}`;
                let reply = await twistJuryChannel.send(replyContent);
                let reaction = await reply.react(affirmationEmoji);
                //Updates the message to note who needs to accept
                let messageUpdater = client.setInterval(async () => {
                    let votes = reaction.users.array().length;
                    if (votes < 6) 
                    {
                        //TODO: Grammar
                        reply.edit(`${replyContent}\n\nReact with ${affirmationEmoji} to approve this twist. ${6 - votes} votes are still needed.`);
                    }
                    else
                    {
                        reply.edit(`${replyContent} \nAcknowledged!`);
                        await reply.pin();
                        client.clearInterval(messageUpdater);
                    }
                }, 1500);
            }
            else 
            {
                await twistJuryChannel.send(errMessage.replace(/\n$/, ""));
            }
        }
        //!challenge calls a new challenge
        else if (message.content.startsWith("!challenge")) 
        {
            //Semantic errors:
            let errMessage = "";
            if (message.mentions.members.length < 1) 
            {
                errMessage += `Please only assign challenges to at least one person. (Your message includes ${message.mentions.members.length} people.)\n`;
            }
            if (!(message.content.includes("[") && message.content.includes("]"))) 
            {
                errMessage += "Please include a challenge delimited by [...].\n";
            }
            //If there are no errors, proceed
            if (errMessage == "")
            {
                let challenge = message.content.substring(message.content.indexOf("[") + 1, message.content.lastIndexOf("]"));
                let replyContent = `New challenge for ${message.mentions.members.map(a => a.toString())}: ${challenge}`;
                let reply = await twistJuryChannel.send(replyContent);
                let reaction = await reply.react(affirmationEmoji);
                //Updates the message to note who needs to accept
                let messageUpdater = client.setInterval(async () => {
                    let pendingInvites = message.mentions.users.array().filter(user => !reaction.users.array().some(it => user.id == it.id)).map(user => user.toString());
                    let usersMessage = "";
                    if (pendingInvites.length > 0) 
                    {
                        //TODO: Grammar
                        reply.edit(`${replyContent}\n\nReact with ${affirmationEmoji} to confirm your participation. \n${pendingInvites} still need(s) to accept.`);
                    }
                    else
                    {
                        reply.edit(`${replyContent} \nEveryone has accepted!`);
                        await reply.pin();
                        client.clearInterval(messageUpdater);
                    }
                }, 1500);
            }
            else
            {
                await twistJuryChannel.send(errMessage.replace(/\n$/, ""));
            }
        }
    });

});
