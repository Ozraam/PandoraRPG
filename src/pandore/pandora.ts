import { Client, DMChannel, Message, MessageEmbed, NewsChannel, PartialDMChannel, TextChannel, ThreadChannel, User } from "discord.js";
import { Avatar } from "./user/avatar"
import { Combat } from "./combat";

export class Pandora {
    population: Avatar[] = [];
    client: Client;
    combats: Map<Message, Combat> = new Map();

    constructor(client:Client) {
        this.client = client;
    }

    has(user: User) : boolean {
        for(const pop of this.population) {
            if (pop.user == user) return true;
        }
        return false;
    }

    get(user: User) : Avatar {
        for(const pop of this.population) {
            if (pop.user == user) return pop;
        }

        return undefined;
    }

    add(user: User) {
        this.population.push(new Avatar(user))
    }

    async newCombat(channel: DMChannel | PartialDMChannel | NewsChannel | TextChannel | ThreadChannel, user: User) {
        if (!this.has(user)) {
            this.add(user)
        }
        const board = await channel.send({embeds: [new MessageEmbed().setTitle(".")]})
        const c = new Combat(board, user, this)

        return board
    }
}

