
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

const iptv = require("./iptv");
var manifest = require("./manifest.json");

app.set('trust proxy', true)

app.use(cors())

app.get('/', (_, res) => {
	res.redirect('/manifest.json')
	res.end();
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
	res.send(manifest);
	res.end();
});


app.get('/:resource(catalog|meta|stream)/:type/:id/:extra?.json', (req, res) => {

	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('Content-Type', 'application/json');

	console.log(req.params);
	let { resource, type, id } = req.params;
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

})

module.exports = app

