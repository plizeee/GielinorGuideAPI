//API edited from: https://github.com/TiboDeMunck/runelite-live-friend-locations-api
//Require the packages
const express = require('express')
const randomstring = require("randomstring");
const fs = require('fs');
const app = express()
const port = process.env.PORT || 3030;

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


let last_new_coord = null;
//Updates Location Data
async function updateData(newObj, timestamp) {
    let objectAlreadyExisted = false
    data.forEach(d => {
        if (d.name == newObj.name) {
            objectAlreadyExisted = true
            d.name = newObj.name
            d.x = newObj.waypoint.x
            d.y = newObj.waypoint.y
            d.plane = newObj.waypoint.plane
            d.type = newObj.type
            d.title = newObj.title
            d.world = newObj.world
            d.timestamp = timestamp;
        }
    });

    if (!objectAlreadyExisted) data.push({
        "name": newObj.name,
        "x": newObj.waypoint.x,
        "y": newObj.waypoint.y,
        "plane": newObj.waypoint.plane,
        "type": newObj.type,
        "title": newObj.title,
        "world": newObj.world,
        "timestamp": timestamp,
    })

    if(last_new_coord == null || last_new_coord.x != newObj.waypoint.x || last_new_coord.y != newObj.waypoint.y || last_new_coord.plane != newObj.waypoint.plane){
        last_new_coord = newObj.waypoint;

        let dataString = JSON.stringify(data, null, 2);
        console.log(dataString);
    }
}

function checkData(timestamp) {
    for (let i = data.length - 1; i >= 0; i--) {
        if (timestamp - data[i].timestamp > 5000) {
            data.splice(i)
        }
    }
}

function getPlayerLocation(username) {
    return last_new_coord;
}

module.exports = {
    updateData,
    checkData,
    getPlayerLocation
}

/* Significant Locations (chunk coordinates)

Note: You can calculate the chunk coordinates by dividing the player's coordiantes by 64 and rounding down. The remainder is how far into the chunk the player is. For example, if the player is at (x: 100, y: 100), the chunk coordinates are (1, 1) and the player is 36% into the chunk.
    
Misthalin
    Lumbridge: (50, 50)
    Lumbridge Swamp: (49, 49), (50, 49)
    Al Kharid: (51, 49)
    Varrock: (49, 54), (50, 54), (49, 53), (50, 53)
    Draynor Village: (48, 51), (48, 50)
    Draynor Manor: (48, 52)
    Wizards' Tower: (48, 49)
    Barbarian Village: (48, 53)

Asgarnia
    Falador: (45, 52), (47, 52), (46, 51)
    Rimmington: (45, 50), (46, 50)
    Port Sarim: (47, 50), (47, 49)
    South Falador Farm: (47, 51)
    Goblin Village: (46, 54)
    Monastery: (47, 54)
    Dwarven Mine: (47, 53)
    Edgeville: (48, 54)
    Tutorial Island: (48, 48)
    The Node: (48, 47)
    
Kandarin
    East Ardougne: (40, 52), (41, 52), (40, 51), (41, 51)
    West Ardougne: (38, 51), (39, 51)
    Yanille: (39, 48), (40, 48)
    Tree Gnome Village: (39, 49)
    Fight Arena: (40, 49)
    Port Khazard: (41, 49)
    Seers' Village: (42, 54)
    Camelot Castle: (43, 54)
    Catherby: (43, 53), (44, 53)
    Fishing Guild: (40, 53)
    Ranging Guild: (41, 53)
    McGrubor's Wood: (41, 54)

Fremennik Province
    Rellekka: (40, 57), (41, 57)
    Warriors' Guild: (44, 55)
    Burthorpe: (45, 55)
    Heroes' Guild: (45, 54)
    Taverley: (45, 53)
    Grand Tree: (38, 54)
    Gnome Ball Field: (37, 54)
    Agility Training Area: (38, 53)
    
Karamja
    Ship Yard: (46, 47)
    Shilo Village: (44, 46)
    Cairn Isle: (43, 46)
    Kharkazi Jungle: (43, 45), (44, 45), (45, 45)
    Tai Bwo Wannai: (43, 48), (43, 47)
    Brimhaven: (43, 50), (43, 49)
    Gu'Tanoth: (39, 47)
    Jiggig: (38, 47)
    Castle Wars: (37, 48)
    
Tirannwn
    Port Tyras: (33, 48)
    Tyras Camp: (34, 49)
    Lletya: (38, 49)
    Battlefield: (39, 50)
    Tempoross Cove and Surrounding
    Tempoross Cove: (47, 46)

*/

/* map link example
https://maps.runescape.wiki/osrs/#4/0/0/3013/3355
https://maps.runescape.wiki/osrs/#[zoom]/[surface]/[layer]/x/y

more info here: https://runescape.wiki/w/RuneScape:Map
*/