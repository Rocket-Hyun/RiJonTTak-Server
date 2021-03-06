var firebase = require("firebase");
var ff = require('./frequentFunctions')();
var fcmPush = require('./fcm');

var usersRef = firebase.database().ref("users");
var currencyRef = firebase.database().ref("lastCurrency");

var User = require("../models/user");
var Floor = require("../models/floor");



var CronJob = require('cron').CronJob;
const API_URL = "https://api.korbit.co.kr/v1/ticker/detailed?currency_pair=xrp_krw";
var request = require('request');

var getCurrency = function(cb) {
    request(API_URL, function(err, apiResponse, apibody){
        try {
            var rawCurrency = JSON.parse(apibody);
            
            cb(Math.floor(rawCurrency.last/100));
        } catch(e) {
            console.log("error occured while geting the currency");
            console.log(`ERROR: #{e}`);
        }
    });
};


var job = new CronJob('1 * * * * *', function() {
    console.log('updating every five min...');
    var updateCallBack = function(currency) {
        var currency = Number(currency);
        currencyRef.once("value").then(function(snapshot){
            var lastCurrency = Number(snapshot.val().floor);
            // TODO User 업데이트 하는 부분 Model로 빼기
            if(currency > lastCurrency) {
                var fcm = {
                    push: fcmPush,
                    to: "/topics/my_level_"+lastCurrency,
                    msg: {
                        type: "floor-update",
                        lastFloor: Number(lastCurrency),
                        updatedFloor: Number(currency)
                    }
                }

                User.updateUsersFloor(lastCurrency, currency, fcm);

                currencyRef.set({
                    updatedAt: ff.getCurrentDate(),
                    floor: currency
                }).then(function(){
                        console.log("updated last currency: " + currency);
                        console.log("updated users floors: " + lastCurrency + " to " + currency);
                });
            } else {
                currencyRef.set({
                    updatedAt: ff.getCurrentDate(),
                    floor: currency
                }).then(function(){
                    console.log("updated last currency: " + currency);
                });
            }
        }, function(err){
            console.log("error occurred: " + err.code);
        });
    }

    getCurrency(updateCallBack);

    User.getUsersPopulation(Floor.updateFloorPopulation);

}, null, true, 'Asia/Seoul');

module.exports = function() {
    return job;
}
