import { User } from "discord.js";
import { Avatar } from "./avatar"

export class Pandora {
    population: Avatar[] = []

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
}

