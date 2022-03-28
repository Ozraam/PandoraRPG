import { Client, Emoji, Message, User } from "discord.js";
import { Fighter } from "./user/fighter";
import { Pandora } from "./pandora";
import { randomP, removeReaction, choiceStat } from './utilities';
import { Monster } from "./monster/monster"
import { readFileSync } from "fs"

const monsterConfig = JSON.parse(readFileSync("src/pandore/monsterConfig.json").toString())


export const EMOJI = {
    coin: "\u{1FA99}",
    sword: "\u2694",
    heart: "\u2764",
    shield: "\u{1F6E1}",
    valid: "\u2705"
}


export class Combat {

    board: Message;
    fighter: Fighter;
    champion: Monster;
    turn: number = 0;

    state: number = 0;

    info: string = "";

    client: Client;


    constructor(board: Message, user: User, world: Pandora) {

        this.client = world.client

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
            thumbnail: { url: this.champion.config.image },
            fields: [
                {
                    name: "Inventaire",
                    value: `Coin: ${this.fighter.user.coin}${EMOJI.coin}`
                },
                {
                    name: "Préparation au combat !",
                    value: `${this.fighter.user.user.username} va se battre contre ${this.champion.config.name}\n`
                }, {
                    name: `Stats de ${this.champion.config.name} :`,
                    value: `Vie: ${this.champion.health.toFixed(2)} ${EMOJI.heart}\nAttaque: ${this.champion.dommage.toFixed(2)} ${EMOJI.sword}\nParade: ${this.champion.protection.toFixed(0)} ${EMOJI.shield}`
                }, {
                    name: `Stats de ${this.fighter.user.user.username}:`,
                    value: `Vie: ${this.fighter.health.toFixed(2)} ${EMOJI.heart}\nAttaque: ${this.fighter.dommage.toFixed(2)} ${EMOJI.sword}\nParade: ${this.fighter.protection.toFixed(2)} ${EMOJI.shield}`
                }
            ],
            footer: {
                text: `Points à attribuer: ${this.fighter.lvl}\n10 coin: 1 lvl en plus ${EMOJI.coin}${this.info != "" ? "\n" + this.info : ""}`
            }
        };
    }

    //initialise the message with the reaction and the first intro embed
    async createBoard() {

        const embed = [
            this.getIntro()
        ]

        this.board.edit({ embeds: embed });
        this.board.react(EMOJI.heart);
        this.board.react(EMOJI.sword);
        this.board.react(EMOJI.shield);
        this.board.react(EMOJI.coin);
        this.board.react(EMOJI.valid);
    }

    // execute user action using state of the fight
    do(user: User, action: Emoji) {
        if (user != this.fighter.user.user) return
        switch (this.state) {
            case 0: { this.lvlup(action); break; }
            case 1: {
                return this.fight(action);
            }
        }
        this.info = ""
        return false
    }

    // upgrade stat of the user
    lvlup(action: Emoji) {
        if (this.fighter.lvl == 0 && action.name != EMOJI.valid) return;

        switch (action.name) {

            case EMOJI.heart: { this.fighter.health *= 1.08; break; }
            case EMOJI.sword: { this.fighter.dommage *= 1.08; break; }
            case EMOJI.shield: { this.fighter.protection *= 1.08; break; }
            case EMOJI.coin: {


                if (this.fighter.user.coin < 10) {
                    console.log("COIN");
                    this.info = `Pas asser de coin ${EMOJI.coin}`

                } else {
                    this.fighter.lvl++;
                    this.fighter.user.coin -= 10;
                }
                break;
            }
            case EMOJI.valid: {
                this.state = 1
                this.setFight()
                removeReaction(this.board, action.name, this.fighter.user.user.id)
                return
            }
            default: return
        }

        removeReaction(this.board, action.name, this.fighter.user.user.id)

        if (action.name != EMOJI.coin) this.fighter.lvl--;

        this.board.edit({ embeds: [this.getIntro()] })

    }

    // return embed message with action played in this turn
    getFigthTurn() {
        // return text based on the action of the fighter
        let fightText = (nom: string, action: number[]) => {
            if (action[0] == 1) {
                return `${nom} à infligé ${action[1].toFixed(2)} dégats !`
            } else if (action[0] == 2) {
                return `${nom} à paré une attaque, il renvoi ${action[1].toFixed(2)} dégats sur l'adversaire !`
            } else if (action[0] == 0) {
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
                    name: `Action de ${this.champion.config.name} ${this.champion.health.toFixed(2)}${EMOJI.heart}`,
                    value: fightText(this.champion.config.name, this.champion.lastAction)
                },
                {
                    name: `Action de ${this.fighter.user.user.username} ${this.fighter.health.toFixed(2)}${EMOJI.heart}`,
                    value: fightText(this.fighter.user.user.username, this.fighter.lastAction)
                }
            ]
        };
    }

    // Create the first message for the fight
    setFight() {
        removeReaction(this.board, EMOJI.valid, this.client.user.id)
        removeReaction(this.board, EMOJI.valid, this.fighter.user.user.id)

        removeReaction(this.board, EMOJI.coin, this.client.user.id)
        removeReaction(this.board, EMOJI.coin, this.fighter.user.user.id)
        this.board.edit({ embeds: [this.getFigthTurn()] })
    }

    // do figth sequence
    fight(action: Emoji) {

        this.turn++;
        const listAction = [EMOJI.heart, EMOJI.sword, EMOJI.shield];
        if (!listAction.includes(action.name)) return;
        removeReaction(this.board, action.name, this.fighter.user.user.id)

        const actionUser = listAction.indexOf(action.name);

        const actionMonster = randomP(this.champion.config.actionChance);

        const actionPhase = [[0, 0], [0, 0], [0, 0]];
        // Attaque Phase
        if (actionUser == 1) {
            actionPhase[1][0] = this.fighter.dommage + Math.random() * 2 - 1
        }
        if (actionMonster == 1) {
            actionPhase[1][1] = this.champion.dommage + Math.random() * 2 - 1;
        }

        // Parade Phase
        if (actionUser == 2) {
            actionPhase[2][0] = actionPhase[1][1] * this.fighter.protection
        }
        if (actionMonster == 2) {
            actionPhase[2][1] = actionPhase[1][0] * this.champion.protection
        }

        // Heal Phase
        if (actionUser == 0) {
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

        if (this.fighter.health <= 0) {
            this.state = 4;
            this.winScreen();
            return true;
        }

        if (this.champion.health <= 0) {
            this.state = 3;
            this.winScreen();
            return true;
        }

        this.board.edit({ embeds: [this.getFigthTurn()] });

        return false;
    }

    // show win Screen 
    winScreen() {

        let field = {
            name: `Victoire`,
            value: `Bravo ${this.fighter.user.user.username}! Vous avez tué Stéphane...\nVous avez gagner ${this.champion.config.loots.coin} coin`
        };
        this.fighter.user.coin += this.champion.config.loots.coin;

        if (this.state == 4) {
            field = {
                name: "Défaite",
                value: "Comment as tu fait pour perde contre Stéphane ?\nLa honte...\nVous avez perdu 3 coin"
            };
            this.fighter.user.coin -= this.champion.config.loots.coin - 3;
        }

        const embed = {
            title: `Victoire de ${this.state == 4 ? "Stéphane" : this.fighter.user.user.username}!`,
            color: 0xE39657,
            /*author: {
                name: "Ozraam",
                icon_url: "https://styles.redditmedia.com/t5_w4hl3/styles/profileIcon_k1wvp2mtezk81.png"
            },*/
            thumbnail: { url: this.champion.config.image },
            fields: [
                field
            ]
        };

        this.board.edit({ embeds: [embed] });
    }
}





