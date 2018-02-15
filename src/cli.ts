#!/usr/bin/env node
import getSpeed from './index';

getSpeed(10)
    .then(result => {
        console.log(result + ' bytes/sec');
        console.log(result / (2 ** 7) + ' kbps');
        console.log(result / (2 ** 17) + ' mbps');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
