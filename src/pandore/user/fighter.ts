import { User } from "discord.js"
import { Avatar } from "./avatar"
import { readFileSync } from "fs"

const config = JSON.parse(readFileSync("src/pandore/user/userConfig.json").toString())

export class Fighter {
    health: number
    dommage: number
    protection: number
    lvl: number
    lastAction: number[] = [-1, 0]
    user: Avatar
    heal: number

    constructor(user: Avatar) {
        this.health = config.stats.health
        this.dommage = config.stats.dommage
        this.protection = config.stats.protection
        this.lvl = config.stats.lvl
        this.heal = config.stats.heal

        this.user = user;
    }
}