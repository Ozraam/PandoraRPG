import { Message } from "discord.js";

export async function removeReaction(message: Message,emoji: string, id:string) {
    const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(id));
    
    userReactions.forEach((value, key) => {
        try {
        if(key == emoji) value.users.remove(id)
        }
        catch(error) {
            console.log(error);
            message.channel.send("J'ai pas les droit pour le remove d'emoji")
        }
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

export function choiceStat(ch: any) {
    const choice = Math.random() * ch.total;
    let tchoice = 0
    for(const st of ch.choice) {
        tchoice += st.spawnRate
        if(choice < tchoice) return st;
    }
    return ch.choice[0];
}