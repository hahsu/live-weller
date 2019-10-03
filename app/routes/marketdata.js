const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const db = require('../db');

router.get('/:marketKey', function(req, res, next) {
    db.getSpecificMarket(req.params.marketKey).then(market => {
        let status = "Questions to fix to get to level " + (parseInt(market.marketInfo.marketLevel) + 1);
        if (market.marketInfo.marketLevel === 3) {
            status = "Market is at Top Level!";
        }

        let questions = []
        for (const key in market.questions) {
            if (key !== "undefined") {
                questions.push({key: key, answer: market.questions[key]});
            }
        }

        let missed = [];
        for (const key in market.missedQuestions) {
            missed.push({key: market.missedQuestions[key].replace('<span class=\"boldanswer\">', '').replace('</span>', '')});
        }
	
		res.render('marketdata', {
            name: market.marketInfo.marketName,
            level: market.marketInfo.marketLevel,
            address: market.marketInfo.address,
            size: market.marketInfo.storeType,
            first: market.personalInfo.firstName,
            last: market.personalInfo.lastName,
            email: market.personalInfo.email,
            status,
            questions,
            missed
        });
	}).catch(error => {
        console.log(error);
    });
});

function isAuthorized(req, res, next){
	if(req.cookies.token)
		next();

	else
		res.render('admin-login');
}

module.exports = router;