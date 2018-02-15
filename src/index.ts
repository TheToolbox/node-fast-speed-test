import * as https from 'https';
import { IncomingMessage } from 'http';

const token = 'true&token=YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm';

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

async function getBody(response: IncomingMessage): Promise<string> {
    return new Promise<string>(resolve => {
        let data = '';
        response.on('data', d => data += d);
        response.on('end', () => resolve(data));
    });
}

async function chooseVideos(): Promise<string[]> {
    const response = await get('https://api.fast.com/netflix/speedtest?https=' + token);
    try {
        const urls: { 'url': string }[] = JSON.parse(await getBody(response));
        const targets = urls.map(urlobject => urlobject.url);
        return targets;
    } catch (err) {
        throw new Error('Failed to select a cdn server: ' + err);
    }
}

/**
 * Uses 3 connections to netflix cdns, counting bytes transferred.
 * Uses 0.2s time slices, averaged w/ sma5.
 * Resolves when the first video finished downloading.
 * Returns Speed in bytes per second.
 * 
 * @export
 * @param {number} [timeLimitInSeconds=60] time limit for the speed test (60 sec by default)
 * @returns {Promise<number>} Speed in bytes per second
 */
export default async function getSpeed(timeLimitInSeconds: number = 60): Promise<number> {
    const timeLimitInMS = timeLimitInSeconds * 1000; //ensure existence and convert to ms
    const startTime = Date.now();
    const targets = await chooseVideos();

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
            if (done || (Date.now() - startTime) > timeLimitInMS) {
                resolve(average(recents));
            } else {
                i = (i + 1) % recents.length; //loop through recents
                recents[i] = bytes / (interval / 1000); //add most recent bytes/second
                bytes = 0;//reset byte count
            }
        }, interval);
    });
}
