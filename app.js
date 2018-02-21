var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
var firebase = require("firebase");

firebase.initializeApp({
    serviceAccount: "../credentials/RiJonTtak-308ee4a7684d.json",
    databaseURL: "https://rijonttak.firebaseio.com"
});

var port = process.env.PORT || 8080;

var userRouter = require('./routes/user')(app);
// TODO url 정규표현식 처리하기
app.use('/api/users', userRouter);

var currencyRouter = require('./routes/currency')(app);
app.use('/api/currency', currencyRouter);

var noteRouter = require('./routes/note')(app);
app.use('/api/notes', noteRouter);

var floorRouter = require('./routes/floor')(app);
app.use('/api/floors', floorRouter);

var server = app.listen(port, function(){
    console.log('Example app listening on port ' + port);
});
