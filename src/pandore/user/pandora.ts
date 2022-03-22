import { User } from "discord.js";
import { Avatar } from "./avatar"
import { writeFile } from "fs"

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

    save() {
       
        writeFile("test.txt", JSON.stringify({}), function(err) {
            if (err) {
                console.log(err);
            }
        });
    }
}

