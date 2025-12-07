
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

const iptv = require("./iptv");
var manifest = require("./manifest.json");
const config = require('./config.js');

app.set('trust proxy', true)

app.use(cors())

app.use(express.static(path.join(__dirname, 'vue', 'dist')));
app.use(express.static(path.join(__dirname, 'vue', 'public')));

app.get('/', (_, res) => {
	res.sendFile(path.join(__dirname, 'vue', 'dist', 'index.html'));
});


app.get('/manifest.json', (req, res) => {
	manifest.catalogs = [{
		"type": "tv",
		"id": "stremio_iptv_id:nz",
		"name": "New Zealand TV",
		"extra": [{ name: "search", isRequired: false }]
	}];

	manifest.behaviorHints.configurationRequired = false;
	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('Content-Type', 'application/json');

	// Create a copy of the manifest to avoid mutating the original require cache
	const manifestCopy = { ...manifest };
	const protocol = req.headers['x-forwarded-proto'] || req.protocol;
	const host = req.get('host');
	const baseUrl = `${protocol}://${host}`;

	manifestCopy.logo = baseUrl + manifest.logo;
	manifestCopy.background = baseUrl + manifest.background;

	res.send(manifestCopy);
	res.end();
});

const handler = (req, res, next) => {
	let { resource, type, id } = req.params;

    if (!['catalog', 'meta', 'stream'].includes(resource)) {
        return next();
    }

	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('Content-Type', 'application/json');

	console.log(req.params);
	let extra = req.params.extra ? Object.fromEntries(new URLSearchParams(req.params.extra)) : {};

	if (resource == "catalog") {
		if ((type == "tv")) {
			if (extra && extra.search) {
				console.log("search", extra.search);
				iptv.search(extra.search)
					.then((metas) => {
						res.send(JSON.stringify({ metas }));
						res.end();
					}).catch(error => console.error(error));
			} else {
				iptv.catalog()
					.then((metas) => {
						res.send(JSON.stringify({ metas }));
						res.end();
					}).catch(error => console.error(error));
			}
		}
	}
	else if (resource == "meta") {
		if ((type == "tv")) {
			console.log("meta", id);
			iptv.meta(id)
				.then((meta) => {
					console.log(meta)
					res.send(JSON.stringify({ meta }));
					res.end();
				}).catch(error => console.error(error));
		}
	}

	else if (resource == "stream") {
		if ((type == "tv")) {
			console.log("stream", id);
			iptv.stream(id)
				.then((stream) => {
					console.log(stream)
					res.send(JSON.stringify({ streams: stream }));
					res.end();
				}).catch(error => console.error(error));
		}
	} else {
		res.end();
	}

};

app.get('/:resource/:type/:id/:extra.json', handler);
app.get('/:resource/:type/:id.json', handler);

module.exports = app
