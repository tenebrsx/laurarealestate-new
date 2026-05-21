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

const fetchPage = (page) => {
    return new Promise((resolve, reject) => {
        const opts = { ...options, path: `/v1/properties?page=${page}&limit=50&search[statuses][]=published` };
        const req = https.request(opts, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
};

async function main() {
    try {
        console.log("Fetching page 1...");
        const page1 = await fetchPage(1);
        const total = page1.pagination.total;
        const limit = page1.pagination.limit;
        const totalPages = Math.ceil(total / limit);
        let allProps = [...page1.content];
        
        for (let p = 2; p <= totalPages; p++) {
            const pData = await fetchPage(p);
            if (pData.content) {
                allProps = allProps.concat(pData.content);
            }
        }
        
        console.log(`Fetched ${allProps.length} properties.`);
        
        // Group by location names
        const locations = new Set();
        allProps.forEach(p => {
            if (p.location) {
                locations.add(p.location);
            }
        });
        
        console.log("Unique location strings in EasyBroker:");
        console.log(JSON.stringify(Array.from(locations).sort(), null, 2));
    } catch (e) {
        console.error(e);
    }
}

main();
