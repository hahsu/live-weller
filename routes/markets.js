const express = require('express');
const firebase = require('firebase');
const config = require('./config.js');
const router = express.Router();

if (!firebase.apps.length) {
	firebase.initializeApp(config.config);
}
// Creates connection to database.
const db = firebase.database();
// Links to head of database.
const ref = db.ref("live_weller");
// Links to markets list.
const marketsRef = ref.child("markets");

function generateKey(name, address) {
	return name.replace(/[^0-9a-zA-Z," ]/gi, '') + ", " + address.replace(/[^0-9a-zA-Z," ]/gi, '')
}

router.get('/', function(req, res, next) {
	let markets = [];

	marketsRef.once('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			const childData = childSnapshot.val().marketInfo;

			markets.push({
				name: childData.marketName, 
				address: childData.address, 
				size: childData.storeType, 
				zip: childData.zip,
				level: childData.marketLevel,
				key: generateKey(childData.marketName, childData.address)
			});
		});

		res.render('markets', {markets});
	});
});

module.exports = router;
