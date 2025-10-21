#!/usr/bin/env node
import getSpeed from './index';

getSpeed(10)
    .then(result => {
        console.log(result + ' bytes/sec');
        console.log(result * 8 / 1000 + ' kbps');
        console.log(result * 8 / 1000000 + ' mbps');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
