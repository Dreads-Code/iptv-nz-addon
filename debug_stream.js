const axios = require('axios');

const url = "https://i.mjh.nz/.r/discovery-hgtv.m3u8";

async function debugStream() {
    try {
        console.log(`Fetching ${url}...`);
        const response = await axios.get(url, {
            maxRedirects: 5,
            validateStatus: null
        });

        console.log("Final URL:", response.request.res.responseUrl);
        console.log("Content-Type:", response.headers['content-type']);
        console.log("Access-Control-Allow-Origin:", response.headers['access-control-allow-origin']);

        // Check if relative paths work on original domain
        const relativeUrl = "https://i.mjh.nz/.r/index_7.m3u8"; // Hypothetical relative path
        try {
            await axios.head(relativeUrl);
            console.log(`Relative path on original domain (${relativeUrl}) EXISTS (Unexpected)`);
        } catch (e) {
            console.log(`Relative path on original domain (${relativeUrl}) failed: ${e.response ? e.response.status : e.message}`);
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

debugStream();
