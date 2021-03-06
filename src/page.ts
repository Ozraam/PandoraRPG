import { Message, MessageEmbed, Emoji, DMChannel, PartialDMChannel, NewsChannel, TextChannel, ThreadChannel, User, Client } from "discord.js"
import { removeReaction } from "./pandore/utilities"
import { Combat, EMOJI } from "./pandore/combat"
import { Pandora } from "./pandore/pandora";

class Pages {
    index: number = 0;
    pages : MessageEmbed[] = [];
    time: number;
    timeout: number;
    canTimeout: boolean = true;
    combat: Combat

    constructor(pages: MessageEmbed[],timeout = 300000) {
        this.time = new Date().getTime();
        this.timeout = timeout;
        this.pages = pages;
    }

    getPage() {
        return this.pages[this.index];
    }
}

// Control Pagination
export class PageMessages {
    messages : Map<Message, Pages> = new Map();
    static left = "\u2B05"
    static right = "\u27A1"
    static sword = "\u2694"
    client: Client
    world: Pandora

    constructor(client: Client) {
        setInterval(() => {
            let k = []
            this.messages.forEach((value, key)=> {
                if(new Date().getTime() - value.time > value.timeout && value.canTimeout) {
                    this.messages.delete(key)
                    removeReaction(key, PageMessages.left, this.client.user.id)
                    removeReaction(key, PageMessages.right, this.client.user.id)
                    removeReaction(key, PageMessages.sword, this.client.user.id)
                }
            })
        }, 100000)

        this.world = new Pandora(client);
        this.client = client;
    }

    addMessage(message: Message, pages: MessageEmbed[]) {
        let p = new Pages(pages)
        
        this.messages.set(message, p);
        message.react(PageMessages.left)
        message.react(PageMessages.sword)
        message.react(PageMessages.right)
    }

    async send(channel: DMChannel | PartialDMChannel | NewsChannel | TextChannel | ThreadChannel, pages: MessageEmbed[]) {
        let p = new Pages(pages)
        let message = await channel.send({embeds: [pages[0]]})
        this.messages.set(message, p);
        message.react(PageMessages.left)
        message.react(PageMessages.sword)
        message.react(PageMessages.right)
    }

    addPage(message: Message,page: MessageEmbed) {
        if(!this.messages.has(message)) return;
        let pages = this.messages.get(message);
        pages.pages.push(page);
        this.messages.set(message, pages);
    }

    async changePages(message: Message, emoji: Emoji, user: User) {
        if((!this.messages.has(message) && !this.world.combats.has(message)) || user.bot) return;
        
        if(this.world.combats.has(message)) {
            if(this.world.combats.get(message).do(user, emoji)) {
                this.world.combats.delete(message)
                removeReaction(message, EMOJI.heart, this.client.user.id)
                removeReaction(message, EMOJI.sword, this.client.user.id)
                removeReaction(message, EMOJI.shield, this.client.user.id)
            }
            return
        }

        let pages = this.messages.get(message);
        
        
        if (emoji.name == PageMessages.left) pages.index--
        else if(emoji.name == PageMessages.right) pages.index++
        else if(emoji.name == PageMessages.sword) {
            if(pages.combat !== undefined) return

            
            const board = await this.world.newCombat(message.channel, message.author)
            pages.combat = this.world.combats.get(board);
            removeReaction(message, emoji.name, user.id)
        
            return
        }
        else return
        removeReaction(message, emoji.name, user.id)
        pages.index = pages.index % pages.pages.length
        if(pages.index < 0) pages.index = pages.pages.length-1
        
        message.edit({embeds: [pages.getPage()]})
        
    }
}

