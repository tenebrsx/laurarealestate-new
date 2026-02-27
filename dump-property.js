const https = require('https');

const options = {
    hostname: 'api.easybroker.com',
    port: 443,
    path: '/v1/properties?limit=5',
    method: 'GET',
    headers: {
        'X-Authorization': 'xnv5jq5sv9dnkjtli9s3pepbe5lzqp',
        'Accept': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        const data = JSON.parse(body);
        const prop = data.content[0];
        console.log(JSON.stringify(prop, null, 2));
    });
});

req.on('error', error => {
    console.error(error);
});

req.end();
