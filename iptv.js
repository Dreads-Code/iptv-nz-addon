const parser = require('iptv-playlist-parser');
const axios = require('axios').default;
const { XMLParser } = require("fast-xml-parser");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

const M3U8_URL = "https://i.mjh.nz/nz/raw-tv.m3u8";
const EPG_URL = "https://i.mjh.nz/nz/epg.xml";

function parseEpgTime(timeStr) {
    // Format: YYYYMMDDHHMMSS +0000
    // Example: 20251123235000 +0000
    if (!timeStr) return null;
    const year = timeStr.substring(0, 4);
    const month = timeStr.substring(4, 6) - 1; // Months are 0-indexed
    const day = timeStr.substring(6, 8);
    const hour = timeStr.substring(8, 10);
    const minute = timeStr.substring(10, 12);
    const second = timeStr.substring(12, 14);
    return new Date(Date.UTC(year, month, day, hour, minute, second));
}

async function fetchData() {
    let data = cache.get("data");
    if (data) return data;

    console.log("Fetching data from sources...");
    try {
        const [m3u8Response, epgResponse] = await Promise.all([
            axios.get(M3U8_URL),
            axios.get(EPG_URL)
        ]);

        const playlist = parser.parse(m3u8Response.data);
        const xmlParser = new XMLParser({ ignoreAttributes: false });
        const epg = xmlParser.parse(epgResponse.data);

        const channels = {};
        const epgMap = {};
        const programmesMap = {};

        // Process EPG Channels
        if (epg.tv && epg.tv.channel) {
            const epgChannels = Array.isArray(epg.tv.channel) ? epg.tv.channel : [epg.tv.channel];
            epgChannels.forEach(c => {
                epgMap[c['@_id']] = {
                    name: c['display-name'],
                    icon: c.icon ? c.icon['@_src'] : null,
                    lcn: c.lcn
                };
            });
        }

        // Process EPG Programmes
        if (epg.tv && epg.tv.programme) {
            const epgProgrammes = Array.isArray(epg.tv.programme) ? epg.tv.programme : [epg.tv.programme];
            epgProgrammes.forEach(p => {
                const channelId = p['@_channel'];
                if (!programmesMap[channelId]) {
                    programmesMap[channelId] = [];
                }
                programmesMap[channelId].push({
                    start: parseEpgTime(p['@_start']),
                    stop: parseEpgTime(p['@_stop']),
                    title: p.title,
                    desc: p.desc,
                    icon: p.icon ? p.icon['@_src'] : null,
                    category: p.category,
                    rating: p.rating ? (Array.isArray(p.rating) ? p.rating[0].value : p.rating.value) : null,
                    starRating: p['star-rating'] ? (Array.isArray(p['star-rating']) ? p['star-rating'][0].value : p['star-rating'].value) : null,
                    date: p.date
                });
            });
        }

        // Process M3U8
        playlist.items.forEach(item => {
            const tvgId = item.tvg.id;
            const channelId = "mjh-" + (tvgId || item.name.replace(/\s+/g, '-').toLowerCase()); // Fallback ID

            // Merge with EPG data if available
            const epgData = epgMap[tvgId] || {};
            const channelProgrammes = programmesMap[tvgId] || [];

            channels[channelId] = {
                id: "stremio_iptv_id:" + channelId,
                name: item.name,
                type: "tv",
                poster: item.tvg.logo || epgData.icon,
                posterShape: 'landscape',
                background: item.tvg.logo || epgData.icon,
                logo: item.tvg.logo || epgData.icon,
                description: `Watch ${item.name}`,
                url: item.url,
                programmes: channelProgrammes, // Store programmes
                behaviorHints: {

                }
            };

            // Add proxy headers if present in M3U8
            if (item.http && (item.http['user-agent'] || item.http['referrer'])) {
                channels[channelId].behaviorHints.proxyHeaders = {
                    request: {}
                };
                if (item.http['user-agent']) {
                    channels[channelId].behaviorHints.proxyHeaders.request['User-Agent'] = item.http['user-agent'];
                }
                if (item.http['referrer']) {
                    channels[channelId].behaviorHints.proxyHeaders.request['Referer'] = item.http['referrer'];
                }
            }
        });

        data = Object.values(channels);
        cache.set("data", data);
        console.log(`Cached ${data.length} channels.`);
        return data;

    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

async function catalog() {
    const channels = await fetchData();
    return channels.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        poster: c.poster,
        posterShape: c.posterShape
    }));
}

async function search(query) {
    const channels = await fetchData();
    return channels.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        poster: c.poster,
        posterShape: c.posterShape
    }));
}

async function meta(id) {
    const channels = await fetchData();
    const channel = channels.find(c => c.id === id);
    if (!channel) return null;

    let metaObj = {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        poster: channel.poster,
        background: channel.background,
        logo: channel.logo,
        description: channel.description,
        behaviorHints: {
            defaultVideoId: channel.id // Ensure it plays the stream
        }
    };

    // Find current program
    if (channel.programmes && channel.programmes.length > 0) {
        const now = new Date();
        const currentProgram = channel.programmes.find(p => p.start <= now && p.stop > now);

        if (currentProgram) {
            metaObj.name = currentProgram.title || channel.name;

            // Description without rating prefix
            metaObj.description = (currentProgram.desc || "") + "\n\n" + channel.description;

            if (currentProgram.icon) {
                metaObj.poster = currentProgram.icon;
                metaObj.background = currentProgram.icon;
            }
            if (currentProgram.start && currentProgram.stop) {
                metaObj.runtime = (currentProgram.stop - currentProgram.start) / 1000 / 60; // minutes
            }
            if (currentProgram.date) {
                metaObj.releaseInfo = currentProgram.date;
            }

            // Genres: Categories + Rating + IMDb Rating
            metaObj.genres = [];
            if (currentProgram.category) {
                const cats = Array.isArray(currentProgram.category) ? currentProgram.category : [currentProgram.category];
                metaObj.genres.push(...cats);
            }
            if (currentProgram.rating) {
                metaObj.genres.push(currentProgram.rating);
            }
            if (currentProgram.starRating) {
                metaObj.genres.push(`IMDb: ${currentProgram.starRating}`);
            }
        }
    }

    return metaObj;
}

async function stream(id) {
    const channels = await fetchData();
    const channel = channels.find(c => c.id === id);
    if (!channel) return [];

    let streamUrl = channel.url;
    try {
        // Resolve redirect to get the final URL so relative paths work in Stremio Web
        const response = await axios.head(channel.url, {
            maxRedirects: 5,
            validateStatus: null
        });
        if (response.request && response.request.res && response.request.res.responseUrl) {
            streamUrl = response.request.res.responseUrl;
        }
    } catch (e) {
        console.error(`Error resolving stream URL for ${id}:`, e.message);
    }

    return [{
        name: channel.name,
        title: channel.name,
        url: streamUrl,
        behaviorHints: channel.behaviorHints
    }];
}

module.exports = {
    catalog,
    search,
    meta,
    stream
};
