import { Ping } from './commands/ping.js';

export class Prototype {
    constructor() {
        this.name = 'Prototype';
        this.version = '1.0.0';
    }

    async executeCommand(commandName) {
        switch (commandName) {
            case 'ping':
                const pingCommand = new Ping();
                return pingCommand.execute();
            default:
                return `Unknown command: ${commandName}`;
        }
    } 
}