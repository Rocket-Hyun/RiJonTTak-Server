const API_URL = "https://api.korbit.co.kr/v1/ticker/detailed?currency_pair=xrp_krw";
var request = require('request');
var strftime = require('strftime');

var timestampToDate = function(timestamp) {
    return strftime('%F %T', new Date(timestamp));
};

var rippleCurrencyToFloor = function(currency) {
    return Math.floor(Number(currency)/100);
}

var getCurrency = function(httpResponse) {

    request(API_URL, function(err, apiResponse, apibody){
        var rawCurrency = JSON.parse(apibody);
        var refinedCurrency = {
            time: timestampToDate(rawCurrency.timestamp),
            floor: rippleCurrencyToFloor(rawCurrency.last)
        }

        httpResponse.json(refinedCurrency);
    });
};

module.exports.getCurrency = function(res) {
  return getCurrency(res);
};