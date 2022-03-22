import config from "./monsterConfig.json"

interface MConfig {
    name: string,
    stats: {
        health: number,
        dommage: number,
        protection: number,
        lvl: number,
        upRate: number
    }
}

export class Monster {
    health: number
    dommage: number
    protection: number
    lvl: number
    lastAction: number[] = [-1,0]
    config : MConfig
    
    constructor() {
        this.config = config[Math.floor(Math.random() * config.length)]
        this.health = this.config.stats.health
        this.dommage = this.config.stats.dommage
        this.protection = this.config.stats.protection
        this.lvl = this.config.stats.lvl

        for(let i = 0; i < this.lvl; i++) {
            const p = Math.random()
            if(p < 1/3) this.health *= this.config.stats.upRate
            else if (p < 2/3) this.dommage *= this.config.stats.upRate
            else this.protection *= this.config.stats.upRate
        }
    }
}