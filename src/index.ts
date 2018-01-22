import * as https from 'https';
import { IncomingMessage } from 'http';

function average(arr: number[]): number {
    return arr.reduce((a, b) => a + b) / arr.length;
}

async function get(url: string): Promise<IncomingMessage> {
    return new Promise<IncomingMessage>(resolve =>
        https.get(url, response => {
            resolve(response);
        }).end()
    );
}

async function chooseVideo() {
    const { headers } = await get('https://api.fast.com/netflix/speedtest?https=true');
    const target = headers['location'];
    if (!target) { throw new Error('Fast.com API failed to select a cdn server'); }
    return target;
}

/**
 * Uses 3 connections to netflix cdns, counting bytes transferred.
 * Uses 0.2s time slices, averaged w/ sma5.
 * Resolves when the first video finished downloading.
 * Returns Speed in bytes per second.
 * 
 * @export
 * @returns {Promise<number>} Speed in bytes per second
 */
export default async function getSpeed(): Promise<number> {

    const targets = [
        await chooseVideo(),
        await chooseVideo(),
        await chooseVideo()
    ];

    let bytes = 0;
    let done = false;
    targets.forEach(async target => {
        const stream = await get(target);
        stream.on('data', data => bytes += data.length);
        stream.on('end', () => done = true);
    });

    return new Promise<number>(resolve => {
        let i = 0;
        const recents = [0, 0, 0, 0, 0];//list of most recent speeds 
        const interval = 200;//ms
        setInterval(() => {
            if (done) {
                resolve(average(recents));
            } else {
                i = (i + 1) % recents.length; //loop through recents
                recents[i] = bytes / (interval / 1000); //add most recent bytes/second
                bytes = 0;//reset byte count
            }
        }, interval);
    });
}
