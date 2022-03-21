import { PageMessages } from "./page";
import { Intents, Message, MessageReaction, MessageEmbed, Client, User } from "discord.js"
import config from "./config.json"


/* imports et perm discord */
const client = new Client({
    intents:[
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
});


/* prefix */
const prefix = '$';


/* Connexion du bot */
client.on("ready", () => {
    console.log("OK B.O.T.");
});


/* fonction pour réaction de message discord */
/* by Ozraam#0019 */
function onEmoji(mes: MessageReaction, user: User) {
    let mt = mes.message;
    let m : Message
    if(mt instanceof Message) {
        m = <Message>mes.message
    }
    let e = mes.emoji;
    pagesManager.changePages(m, e, user)
}

let pagesManager = new PageMessages(client);

client.on("messageReactionAdd", onEmoji)

/* activation des fonctionnalités de réaction aux messages */
/* by Ozraam#0019 */
;

/* ===============
==== token =======
=============== */
client.login(config.token);


/* réaction aux messages */
client.on("messageCreate", async message => {

    if (message.author.bot) return;

    // test de ping de bot
    if (message.content === prefix + "t")
    {
        // message.reply("..."); -> réponse mention discord
        pagesManager.send(message.channel, [new MessageEmbed().setTitle("test")]);
    }
});