import { Message } from "discord.js";

export async function removeReaction(message: Message,emoji: string, id:string) {
    const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(id));
    
    userReactions.forEach((value, key) => {
        if(key == emoji) value.users.remove(id)
    })
    
}

export function randomP(choice: number[][]) {
    let l = []
    for (const ch of choice) {
        for (let index = 0; index < ch[1]; index++) {
            l.push(ch[0])
        }
    }

    return l[Math.floor(Math.random() * l.length)]
}