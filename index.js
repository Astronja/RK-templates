import fs from 'fs/promises';
import dotenv from 'dotenv';
dotenv.config();
import { Prototype } from './prototype.js';

async function start (option) {
    let config = JSON.parse(await fs.readFile('./config.json', 'utf8'));
    let token = process.env.token;
    if (option === 'test') {
        token = process.env.ada;
    }
    const prototype = new Prototype(config, token);
    await prototype.login();
}

start();
