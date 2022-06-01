const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get('/', (req,res)=> {
    res.sendFile(path.join(__dirname,'index.html'));
});

app.get('/profile-picture', (req,res)=>{
    console.log(res);
    //readfileSync r&w 
    let img = fs.readFileSync(path.join(__dirname,"images/profile-1.jpg"));
    res.writeHead(200, {"Content-type":"image/jpg"});
    res.end(img, 'binary');
});

// use when starting application locally
let mongoUrlLocal = "mongodb://admin:password@localhost:27017";

// use when starting application as docker container
let mongoUrlDocker = "mongodb://admin:password@mongodb";

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

//######################################

// interface ConnectOptions extends mongodb.MongoClientOptions {
//     /** Set to false to [disable buffering](http://mongoosejs.com/docs/faq.html#callback_never_executes) on all models associated with this connection. */
//     bufferCommands?: boolean;
//     /** The name of the database you want to use. If not provided, Mongoose uses the database name from connection string. */
//     dbName?: string;
//     /** username for authentication, equivalent to `options.auth.user`. Maintained for backwards compatibility. */
//     user?: string;
//     /** password for authentication, equivalent to `options.auth.password`. Maintained for backwards compatibility. */
//     pass?: string;
//     /** Set to false to disable automatic index creation for all models associated with this connection. */
//     autoIndex?: boolean;
//     /** Set to `true` to make Mongoose automatically call `createCollection()` on every model created on this connection. */
//     autoCreate?: boolean;
//   }
// Looking at the new definition of the connect and ConnectOptions, we can see that there is no definition of useNewUrlParser or useUnifiedTopology inside the ConnectOptions. That is the reason we got such an error. You can delete the options useNewUrlParser: true, and useUnifiedTopology: true, and your code should be able to connect to your MongoDB. If you want to pass in some options to the connect() function, then they should follow the new type definition of the ConnectOptions.

//########################################

// "user-account" in demo with docker. "my-db" in demo with docker-compose
let databaseName = "my-db";

app.post('/update-profile', function (req, res) {
  let userObj = req.body;

  MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
    if (err) throw err;

    let db = client.db(databaseName);
    userObj['userid'] = 1;

    let myquery = { userid: 1 };
    let newvalues = { $set: userObj };

    db.collection("users").updateOne(myquery, newvalues, {upsert: true}, function(err, res) {
      if (err) throw err;
      client.close();
    });

  });
  // Send response
  res.send(userObj);
});

app.get('/get-profile', function (req, res) {
  let response = {};
  // Connect to the db
  MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
    if (err) throw err;

    let db = client.db(databaseName);

    let myquery = { userid: 1 };

    db.collection("users").findOne(myquery, function (err, result) {
      if (err) throw err;
      response = result;
      client.close();

      // Send response
      res.send(response ? response : {});
    });
  });
});



app.listen(3000, function(){
    console.log('App listening on port 3000');
})