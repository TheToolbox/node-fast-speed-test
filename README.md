# A nice, simple speed test (with no dependencies!)

Measures how quickly you can pull files from the fast.com Netflix CDNs.

## CLI usage

#### To install
```bash
$ npm install -g fast-speed-test
```

#### To use
```bash
$ speed-test
14581760 bytes/sec
113920 kbps
111.25 mbps
```

## API usage

```js
import getSpeed from 'fast-speed-test';

getSpeed()
  .then(speed => console.log(speed + ' bytes per second'));
```

## Contributing

The implementation used is fairly naive. It runs 3 downloads at once, and stops once the first download completes. It counts the number of bytes transferred every 0.2s, and multiplies by 5. It does a moving average of the last 5 measurements to improve consistency. Improvements are heartily welcomed.