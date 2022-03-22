import { Client, Emoji, Message, User } from "discord.js";
//import { Avatar } from "./user/avatar";
import { Fighter } from "./user/fighter";
import { Pandora } from "./user/pandora";
import { randomP, removeReaction, choiceStat } from './utilities';
import { Monster } from "./monster/monster"
import { readFileSync } from "fs"

const monsterConfig = JSON.parse(readFileSync("src/pandore/monster/monsterConfig.json").toString())



export class Combat {

    origin: Message;
    board: Message;
    fighter: Fighter;
    champion: Monster;
    turn: number = 0;

    state: number = 0

    static sword = "\u2694"
    static heart = "\u2764"
    static shield = "\u{1F6E1}"
    static valid = "\u2714"

    client: Client
    

    constructor(origin: Message, board: Message, user: User, client: Client, world: Pandora) {
        this.origin = origin;

        this.client = client

        // create new Avatar if the user is not part of it
        if(!world.has(user)) {
            world.add(user)
        }

        // init all the fighter
        this.fighter = new Fighter(world.get(user));
        
        this.champion = new Monster(choiceStat(monsterConfig))
        
        this.board = board;

        this.createBoard();
    }

    // create the MessageEmbed of the begining of the fight, where user can spend point
    getIntro() {
        return {
            title: "Préparation au combat",
            color: 0xE39657,
            /*author: {
                name: "Ozraam",
                icon_url: "https://styles.redditmedia.com/t5_w4hl3/styles/profileIcon_k1wvp2mtezk81.png"
            },*/
            thumbnail: { url:this.champion.config.image },
            fields: [
                {
                    name:"Préparation au combat !",
                    value:`${this.fighter.user.user.username} va se battre contre ${this.champion.config.name}\n`
                },{
                    name:`Stats de ${this.champion.config.name} :`,
                    value:`Vie: ${this.champion.health.toFixed(2)} ${Combat.heart}\nAttaque: ${this.champion.dommage.toFixed(2)} ${Combat.sword}\nParade: ${this.champion.protection.toFixed(0)} ${Combat.shield}`
                },{
                    name:`Stats de ${this.fighter.user.user.username}:`,
                    value:`Vie: ${this.fighter.health.toFixed(2)} ${Combat.heart}\nAttaque: ${this.fighter.dommage.toFixed(2)} ${Combat.sword}\nParade: ${this.fighter.protection.toFixed(2)} ${Combat.shield}`
                }
            ],
            footer: {
                text: `Points à attribuer: ${this.fighter.lvl}`
            }
        };
    }

    //initialise the message with the reaction and the first intro embed
    async createBoard() {

        const embed = [
            this.getIntro()
        ]

        this.board.edit({embeds:embed});
        this.board.react(Combat.heart);
        this.board.react(Combat.sword);
        this.board.react(Combat.shield);
        this.board.react(Combat.valid);
    }

    // execute user action using state of the fight
    do(user: User, action: Emoji) {
        if(user != this.fighter.user.user) return
        switch(this.state) {
            case 0: {this.lvlup(action); break;}
            case 1: {
                return this.fight(action); 
            }
        }

        return false
    }

    // upgrade stat of the user
    lvlup(action: Emoji) {

        if(action.name == Combat.heart) {
            this.fighter.health *= 1.08
        } else if (action.name == Combat.sword) {
            this.fighter.dommage *= 1.08
        } else if (action.name == Combat.shield) {
            this.fighter.protection *= 1.08
        } else if (action.name == Combat.valid) {
            this.state = 1
            this.setFight()
            removeReaction(this.board, action.name, this.fighter.user.user.id)
            return
        } else return
        removeReaction(this.board, action.name, this.fighter.user.user.id)

        this.fighter.lvl --;
        // if all lvl are spend, start the fight else edit the intro embed
        if(this.fighter.lvl == 0) {
            this.state = 1
            this.setFight()
        } else {
            this.board.edit({embeds: [this.getIntro()]})
        }
    }

    // return embed message with action played in this turn
    getFigthTurn() {
        // return text based on the action of the fighter
        let fightText = (nom:string,action: number[]) => {
            if(action[0] == 1) {
                return `${nom} à infligé ${action[1].toFixed(2)} dégats !`
            } else if(action[0] == 2) {
                return `${nom} à paré une attaque, il renvoi ${action[1].toFixed(2)} dégats sur l'adversaire !`
            } else if(action[0] == 0) {
                return `${nom} s'est soigné de ${action[1].toFixed(2)} PV !`
            } else {
                return "Rien ne s'est passé..."
            }
        }
        return {
            title: `Tour ${this.turn}`,
            color: 0xE39657,
            /*author: {
                name: "Ozraam",
                icon_url: "https://styles.redditmedia.com/t5_w4hl3/styles/profileIcon_k1wvp2mtezk81.png"
            },*/
            thumbnail: { url: this.champion.config.image },
            fields: [
                {
                    name: `Action de ${this.champion.config.name} ${this.champion.health.toFixed(2)}${Combat.heart}`,
                    value: fightText(this.champion.config.name, this.champion.lastAction)
                },
                {
                    name: `Action de ${this.fighter.user.user.username} ${this.fighter.health.toFixed(2)}${Combat.heart}`,
                    value: fightText(this.fighter.user.user.username, this.fighter.lastAction)
                }
            ]
        };
    }

    // Create the first message for the fight
    setFight() {
        removeReaction(this.board, Combat.valid, this.client.user.id)
        removeReaction(this.board, Combat.valid, this.fighter.user.user.id)
        this.board.edit({embeds: [this.getFigthTurn()]})
    }

    // do figth sequence
    fight(action: Emoji) {

        this.turn ++;
        const listAction = [Combat.heart, Combat.sword, Combat.shield];
        if(!listAction.includes(action.name)) return;
        removeReaction(this.board, action.name, this.fighter.user.user.id)

        const actionUser = listAction.indexOf(action.name);

        const actionMonster = randomP(this.champion.config.actionChance);

        const actionPhase = [[0,0],[0,0],[0,0]];
        // Attaque Phase
        if(actionUser == 1) {
            actionPhase[1][0] = this.fighter.dommage + Math.random() * 2 - 1
        }
        if (actionMonster == 1) {
            actionPhase[1][1] = this.champion.dommage + Math.random() * 2 - 1;
        }

        // Parade Phase
        if(actionUser == 2) {
            actionPhase[2][0] = actionPhase[1][1] * this.fighter.protection
        }
        if (actionMonster == 2) {
            actionPhase[2][1] = actionPhase[1][0] * this.champion.protection
        }

        // Heal Phase
        if(actionUser == 0) {
            actionPhase[0][0] = this.fighter.heal + Math.random() * 2 - 1;
        }
        if (actionMonster == 0) {
            actionPhase[0][1] = this.champion.config.stats.heal + Math.random() * 2 - 1;
        }

        // Resolve Phase

        this.fighter.lastAction = [actionUser, actionPhase[actionUser][0]];
        this.champion.lastAction = [actionMonster, actionPhase[actionMonster][1]];

        this.fighter.health += actionPhase[0][0] - (actionPhase[2][0] == 0 ? actionPhase[1][1] : 0) - actionPhase[2][1];
        this.champion.health += actionPhase[0][1] - (actionPhase[2][1] == 0 ? actionPhase[1][0] : 0) - actionPhase[2][0];


        // final

        if(this.fighter.health <= 0) {
            this.state = 4;
            this.winScreen();
            return true;
        } 

        if(this.champion.health <= 0) {
            this.state = 3;
            this.winScreen();
            return true;
        }

        this.board.edit({embeds:[this.getFigthTurn()]});

        return false;
    }

    // show win Screen 
    winScreen() {

        let field = {
            name: `Victoire`,
            value: `Bravo ${this.fighter.user.user.username}! Vous avez tué Stéphane...\nVous avez gagner 10 coin`
        };
        this.fighter.user.coin += 10;

        if(this.state == 4) {
            field = {
                name: "Défaite",
                value: "Comment as tu fait pour perde contre Stéphane ?\nLa honte...\nVous avez perdu 3 coin"
            };
            this.fighter.user.coin -= 13;
        }

        const embed = {
            title: `Victoire de ${this.state == 4 ? "Stéphane" : this.fighter.user.user.username}!`,
            color: 0xE39657,
            /*author: {
                name: "Ozraam",
                icon_url: "https://styles.redditmedia.com/t5_w4hl3/styles/profileIcon_k1wvp2mtezk81.png"
            },*/
            thumbnail: { url:this.champion.config.image },
            fields: [
                field
            ]
        };

        this.board.edit({embeds:[embed]});
    }
}





