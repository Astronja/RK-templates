import fs from 'fs/promises';

export class PRTS {
    constructor (client, channelid) {
        this.posthouse = channelid;
        this.discordClient = client;
    }

    async receive (id, data) {
        if (typeof(data) == 'string' && data.startsWith('http')) {
            const response = await fetch(data);
            data = await response.json();
        }
    }

    async dispatch (id, data) {
        const path = await this.createBuffer(data);
        const channel = this.discordClient.channels.cache.get(this.posthouse);
        await channel.send({
            content: id,
            files: [
                path
            ]
        });
        await fs.unlink(path);
    }

    async createBuffer(data) {
        const buffer = Buffer.from(data, 'utf-8');
        let path = './data';
        switch (typeof(data)) {
            case 'string':
                path = path + '.txt';
                break;
            case 'object':
                data = JSON.stringify(data, null, 2);
                path = path + '.json';
                break;
        }
        await fs.writeFile(path, buffer);
        return path;
    }
}