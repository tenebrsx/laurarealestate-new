const https = require('https');

const options = {
    hostname: 'api.easybroker.com',
    port: 443,
    path: '/v1/properties?limit=50',
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
        let missing = 0;
        data.content.forEach((p, idx) => {
            // If there's no primary image, and the image array is also empty
            if (!p.title_image_full && (!p.images || p.images.length === 0)) {
                missing++;
                console.log(`[Missing Image] Property ${idx + 1}: ${p.title} (${p.public_id})`);
            }
        });
        console.log(`Total checked: ${data.content.length}`);
        console.log(`Total missing images: ${missing}`);
    });
});

req.on('error', error => {
    console.error(error);
});

req.end();
