import { User } from "discord.js"
import { Avatar } from "./avatar"
import * as config from "./userConfig.json"

export class Fighter {
    health: number
    dommage: number
    protection: number
    lvl: number
    lastAction: number[] = [-1,0]
    user: Avatar
    
    constructor(user: Avatar) {
        this.health = config.stats.health
        this.dommage = config.stats.dommage
        this.protection = config.stats.protection
        this.lvl = config.stats.lvl

        this.user = user;
    }

}