const express = require('express')
require('dotenv').config()
const randomstring = require("randomstring");
const fs = require('fs');
const app = express()
const port = process.env.PORT || 443;
const https = require('https');
const path = require('path');

const Player = require('./player.js');
const Location = require('./location.js');

app.use(express.json());

let data = []
let sharedKey

//Create a Shared Key
if (!process.env.SHARED_KEY) {
    sharedKey = randomstring.generate()
    fs.writeFile('.env', `SHARED_KEY=${sharedKey}`, function (err) {
        if (err) return console.log(err);
        console.log(`Shared Key set: ${sharedKey}\nDelete .env file to generate a new key.`)
    })
} else {
    sharedKey = process.env.SHARED_KEY
    console.log(`Shared Key: ${sharedKey}\nDelete .env file to generate a new key.`)
}

app.use(function (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).json({
            error: 'No credentials sent!'
        });
    }
    if (req.headers.authorization != sharedKey) {
        return res.status(401).json({
            error: 'Wrong credentials'
        });
    }
    next();
});

//Gives Location Data
app.get('/', (req, res) => {
    let timestamp = Date.now()

    Location.checkData(timestamp)
    
    res.send(data)
})

//Receives Location Data
app.post('/post', (req, res) => {
    let newObj = req.body
    let timestamp = Date.now()

    Location.updateData(newObj, timestamp)
    Location.checkData(timestamp)

    // console.log("New Location Data Received");

    res.send(data)
})

//Gives player levels
//we can access this by going to https://pliz.tech/player/PlizzIronman/levels
app.get('/player/:username/levels', async (req, res) => {
    let username = req.params.username;
    let playerLevels = await Player.getPlayerLevels(username);
    res.send(playerLevels);
});

//Gives all player quests
//we can access this by going to https://pliz.tech/player/PlizzIronman/getPlayerQuestsAll
app.get('/player/:username/getPlayerQuestsAll', async (req, res) => {
    let username = req.params.username;
    let playerQuests = await Player.getPlayerQuestsAll(username);
    res.send(playerQuests);
});

//Gives completed player quests
//we can access this by going to https://pliz.tech/player/PlizzIronman/getPlayerQuestsCompleted
app.get('/player/:username/getPlayerQuestsCompleted', async (req, res) => {
    let username = req.params.username;
    let playerQuests = await Player.getPlayerQuestsCompleted(username);
    res.send(playerQuests);
});

//Gives started player quests
//we can access this by going to https://pliz.tech/player/PlizzIronman/getPlayerQuestsStarted
app.get('/player/:username/getPlayerQuestsStarted', async (req, res) => {
    let username = req.params.username;
    let playerQuests = await Player.getPlayerQuestsStarted(username);
    res.send(playerQuests);
});

//Gives not started player quests
//we can access this by going to https://pliz.tech/player/PlizzIronman/getPlayerQuestsNotStarted
app.get('/player/:username/getPlayerQuestsNotStarted', async (req, res) => {
    let username = req.params.username;
    let playerQuests = await Player.getPlayerQuestsNotStarted(username);
    res.send(playerQuests);
});

//Gives player location
//we can access this by going to https://pliz.tech/player/PlizzIronman/getPlayerLocation
app.get('/player/:username/getPlayerLocation', async (req, res) => {
    let username = req.params.username;
    // let playerLocation = await Player.getPlayerLocation(username);
    let playerLocation = Location.getPlayerLocation(username);
    console.log(playerLocation);
    res.send(playerLocation);
});

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, './sslcert/pliz_tech.key')),
  cert: fs.readFileSync(path.join(__dirname, './sslcert/pliz_tech.crt')),
  ca: fs.readFileSync(path.join(__dirname, './sslcert/pliz_tech.ca-bundle'))
};

const httpsServer = https.createServer(sslOptions, app);

httpsServer.listen(port, '0.0.0.0', () => {
  console.log(`Server listening at https://0.0.0.0:${port}`);
}).on('error', (err) => {
  console.error('HTTPS server error:', err);
});