import { User } from "discord.js"

export class Avatar {
    user: User
    coin: number
    bag : number[] = []
    constructor(user: User) {
        this.user = user
        this.coin = 0
    }
}