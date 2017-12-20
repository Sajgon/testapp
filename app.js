
const express = require('express');
const app = express();
const scraperjs = require('scraperjs');
//const pm = require("promisemaker");
//const mysql = require('mysql');
//const credentials = require('../credentials.js');   // Hämta mysql credentials
// console.log("credentials", credentials);
//const db = pm(mysql.createConnection(credentials));


const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
 
 
 // Database Name
const dbName = 'Vintergatan5a-analystics';

// Connection URL
var url = 'mongodb://localhost:27017/';


// Use connect method to connect to the Server
MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected correctly to server");
    const db = client.db(dbName);
 
    const collection = db.collection('vititors');
    
    
    var findDocuments = function(db, callback) {
      // Get the documents collection
      // Find some documents
      collection.find({}).toArray(function(err, docs) {
        assert.equal(err, null);
        assert.equal(2, docs.length);
        console.log("Found the following records");
        console.dir(docs);
        callback(docs);
      });
    }
    
   
    client.close();
});










/*
    SCRAPING
    SCRAPING
*/

let newsFromAB = [];
let newsFromDN = [];

async function scrapeDN(){
    let ab = scraperjs.StaticScraper.create('https://dn.se');
    let news = await ab.scrape(($)=>{
        return $('a[href*="/nyheter"] h2, a[href*="/nyheter"] h3').map(function() {
            return {
                text: $(this).text(),
                url: 'https://dn.se' + $(this).closest('a').attr('href')
            }
        }).get();
    });
    newsFromDN = news;
    //console.log(news);
}

async function scrapeAftonbladet(){
    let ab = scraperjs.StaticScraper.create('https://aftonbladet.se');
    let news = await ab.scrape(($)=>{
        return $('a[href*="/nyheter"] h3').map(function() {
            return {
                text: $(this).text(),
                url: 'https://aftonbladet.se' + $(this).closest('a').attr('href')
            }
        }).get();
    });
    newsFromAB = news;
    //console.log(news);
}


scrapeDN();
//setInterval(scrapeDN, 60*1000);

scrapeAftonbladet();
//setInterval(scrapeAftonbladet, 60*1000);

app.use(express.static(__dirname + '/www'));

//app.get('*',(req,res) => res.send('Hello world!'));
app.get('/ab-news',(req,res) => {
   res.json(newsFromAB);
});

app.get('/dn-news',(req,res) => {
   res.json(newsFromDN);
});

app.get('/all-news', (req, res) => {
  res.json(
    newsFromAB.concat(newsFromDN)
      .sort((a,b) => a.text > b.text ? 1 : -1)
  )
});


app.get('/visitors', (req, res) => {
    
});


app.listen(4001,() =>
    console.log('Listening on port 4001')
);




//console.log(db);










