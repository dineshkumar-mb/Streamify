const https = require('https');
const fs = require('fs');

https.get('https://play.google.com/store/apps/details?id=com.banuchanderjj.stickerapp', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const regex = /https:\/\/play-lh\.googleusercontent\.com\/[a-zA-Z0-9_-]+/g;
        const matches = [...new Set(data.match(regex))];
        fs.writeFileSync('scraped.txt', matches.join('\n'));
    });
});
