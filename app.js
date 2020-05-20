const MongoClient = require("mongodb").MongoClient;
const mongodb = require("mongodb")
const express = require('express');
const app = express();
const cors = require('cors');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const port = process.env.PORT || 8080;
const methodOverride = require('method-override')

app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.set('views', '');
app.set('view engine', 'ejs')
app.use(cors());

const dbConnectionUrl = "mongodb+srv://bilal-ozlu:j1zq6D4mXUsonMkW@bilals-invention-store-8izkj.mongodb.net/test?retryWrites=true&w=majority";

app.post("/users", (request, response) => {
    users.insertOne(Object.assign(request.body, {'numberOfRates': 0, 'sumOfRates': 0}),
     (error, result) => {
        try {
            response.redirect('/');
        }
        catch {
            return response.status(500).send(error);
        }
    });
});

app.get('/', async function (request, response) {
    users.find({}).toArray((error, result) => {
        try {
            response.render('', {users: result, page : 'users'});
        }
        catch {
            return response.status(500).send(error);
        }
    });
});

app.delete('/users/:id', function (request, response) {
    inventions.updateMany({user_id: request.params.id}, {$set: {hide: true}}, function (error, result) {
        if(error) {
            return response.status(500).send(error);
        }
    });
    users.deleteOne({_id: new mongodb.ObjectId(request.params.id)}, function (error, result) {
        if (error) {
            return response.status(500).send(error);
        }
        else {
            response.redirect('/');
        }
    });
});

app.post('/inventions/exhibit/:user_id/:user_name', (request, response) => {
    inventions.insertOne(Object.assign(request.body, { 'numberOfRates': 0, 'sumOfRates': 0,'rates': [],
    'user_id': request.params.user_id, 'user_name': request.params.user_name, hide: false}), (error, result) => {
        try {
            response.redirect('/users/' + request.params.user_id);
        }
        catch {
            return response.status(500).send(error);
        }
    });
});

app.get('/inventions/:id', async function (request, response) {
    inventions.find({_id: new mongodb.ObjectId(request.params.id)}).toArray((error, result) => {
        try {
            response.render('', {theInvention: result[0], page : 'inventionDetails'});
        }
        catch {
            return response.status(500).send(error);
        }
    });
});

app.get('/users/:id', async function (request, response) {
    users.find({_id: new mongodb.ObjectId(request.params.id)}).toArray((error,result) => {
        if (error) {
            return response.status(500).send(error);
        }
        else {
            inventions.find({hide: false}).toArray((error2, result2) => {
                try {
                    response.render('', {userInfo: result[0], userInventions: result2, page : 'inventions'});
                }
                catch {
                    return response.status(500).send(error2);
                }
            });
        }
    });
});

app.put('/inventions/:user_id/drop/:id', (request, response) => {
    inventions.updateOne({_id: new mongodb.ObjectId(request.params.id)}, {$set: {hide:true}}, function(error,result) {
        try {
            response.redirect('/users/' + request.params.user_id);
        }
        catch {
            return response.status(500).send(error);
        }
    });
});

app.put('/inventions/rate/:rater_id/:user_id/:id/:oldRate', (request, response) => {
    var addNew = 1;
    var addRate = parseInt(request.body.newRate) - request.params.oldRate;
    if (request.params.oldRate > 0) {
        addNew = 0;
    }
    if (addNew == 0) {
        inventions.updateOne({_id: new mongodb.ObjectId(request.params.id), "rates.rater_id": request.params.rater_id},
        {$inc: {"rates.$.rate": addRate}}, function(error,result) {
            if (error) {
                return response.status(500).send(error);
            }
        });
    }
    else {
        inventions.updateOne({_id: new mongodb.ObjectId(request.params.id)},
        {$push:  {rates: {rater_id: request.params.rater_id, rate: addRate}}}, function(error,result) {
            if (error) {
                return response.status(500).send(error);
            }
        });
    }
    users.updateOne({_id: new mongodb.ObjectId(request.params.user_id)},
    {$inc: { sumOfRates: addRate, numberOfRates: addNew}}, function(error,result) {
        if (error) {
            return response.status(500).send(error);
        }
    });
    inventions.updateOne({_id: new mongodb.ObjectId(request.params.id)},
    {$inc: { sumOfRates: addRate, numberOfRates: addNew }}, function(error,result) {
        try {
            response.redirect('/users/' + request.params.rater_id);
        }
        catch {
            return response.status(500).send(error);
        }
    });
});

app.listen(port, function () {
    MongoClient.connect(dbConnectionUrl, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db("bilals-invention-store");
        users = database.collection("users");
        inventions = database.collection("inventions");
        console.log("Running RestHub on port " + port);
    });
})
