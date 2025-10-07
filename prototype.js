import os from "os";
import { setInterval } from "timers/promises";
import { GatewayIntentBits, Client, ActivityType } from "discord.js";
import { Command } from "./Prototype/command.js";
import { PRTS } from "./Prototype/prts.js";

export class Prototype {
    constructor(config, dctoken) {
        this.discordToken = dctoken;
        this.name = config.name;
        this.prefix = config.prefix;
        this.model = config.model;
        this.posthouse = config.posthouse;
        this.debugchannel = config.debugchannel;
        this.config = config;
        this.color = 0x000000;
        this.discordClient = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMessageTyping
            ]
        });
    }

    log (message) {
        console.log(`[${this.name}] ${message}`);
    }

    async login() {
        await this.discordClient.login(this.discordToken);
        this.discordClient.once('clientReady', async (c) => {
            this.log(`Logged in as ${c.user.tag}`);
            if (c.user.username.includes("Ada")) {
                if (this.name.includes("Prototype") || this.name.includes("Ada")) {
                    for await (const _ of setInterval(60000)) await this.updateStatus(`👾 · Server Uptime`, os.uptime());
                } else {
                    this.discordClient.user.setPresence({
                        activities: [{ 
                            name: `🤓 · Testing as ${this.name}`, 
                            type: ActivityType.Custom
                        }]
                    });
                }
            } else for await (const _ of setInterval(60000)) await this.updateStatus(`🤖 · ${Object.keys(this.config.versions)[Object.keys(this.config.versions).length - 1]}`, process.uptime());
        });
        this.discordClient.on('messageCreate', async (message) => {
            if (message.mentions.has(this.discordClient.user) && message.content.includes('about')) {
                await message.reply(await this.about());
            }
            if (message.content.startsWith(this.prefix)) {
                const command = message.content.replace(this.prefix, '').trim();
                const request = new Command();
                const response = await request.executeCommand(command);
                await message.reply(response);
            }
            if (message.author.bot && message.author.id != this.discordClient.user.id && message.content.startsWith(this.model)) {
                if (message.channel.id == this.posthouse) { //posthouse
                    const prts = new PRTS(this.discordClient, this.posthouse);
                    await prts.receive(message.content, message.attachments.map(a => a.url)[0]);
                    if (prts.result != undefined) {
                        await message.reply(prts.result);
                    }
                } else await message.reply("Please send PRTS messages to <#1408285577958391922>.");
            }
        });
    }

    async updateStatus (key, uptime) {
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const statusString = `${key}: ${days}d ${hours}h ${minutes}m`;
        this.discordClient.user.setPresence({
            activities: [{ 
                name: statusString,
                type: ActivityType.Custom 
            }]
        });
    }

    async about() { //returns a discord embed
        const versionList = this.config.versions;
        const latestVersion = Object.keys(versionList)[Object.keys(versionList).length - 1];
        const attributions = [
            'Art components - Arknights《明日方舟》',
            'discord.js v14'
        ];
        return {
            embeds: [
                {
                    color: this.color,
                    title: this.name,
                    author: {
                        name: 'Noel A.',
                        icon_url: (await this.discordClient.users.fetch('1023608069063717035')).displayAvatarURL({ format: 'png', dynamic: true })
                    },
                    description: 'Description of the prototype.',
                    thumbnail: {
                        url: (await this.discordClient.users.fetch('1023608069063717035')).displayAvatarURL({ format: 'png', dynamic: true })
                    },
                    fields: [
                        {
                            name: 'Prefix',
                            value: this.prefix,
                            inline: true
                        },
                        {
                            name: 'Version',
                            value: latestVersion,
                            inline: true
                        },
                        {
                            name: 'Liscence',
                            value: 'CC BY-NC 4.0',
                            inline: true
                        },
                        {
                            name: 'Version info',
                            value: versionList[latestVersion]
                        },
                        {
                            name: 'Attributions',
                            value: attributions.join('\n')
                        }
                    ]
                }
            ]
        }
    }
}