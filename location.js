//API edited from: https://github.com/TiboDeMunck/runelite-live-friend-locations-api
//Require the packages
const express = require('express')
const randomstring = require("randomstring");
const fs = require('fs');
const app = express()
const port = process.env.PORT || 443;

//assign regions.json to a variable
const regions = require('./regions.json');

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

    last_new_coord = newObj.waypoint;
    console.log("last_new_coord: ", last_new_coord);

    let playerChunk = getPlayerChunk(last_new_coord);
    console.log("Player Chunk: ", playerChunk);
    let playerZone = getPlayerZone(playerChunk);
    console.log("Player Zone: ", playerZone);
}

function checkData(timestamp) {
    for (let i = data.length - 1; i >= 0; i--) {
        if (timestamp - data[i].timestamp > 5000) {
            data.splice(i)
        }
    }
}

function getPlayerLocation(username) {
    let playerChunk = getPlayerChunk(last_new_coord);
    console.log("Player Chunk for", username, ":", playerChunk);
    let playerZone = getPlayerZone(playerChunk);
    console.log("Player Zone for", username, ":", playerZone);
    return playerZone;
}


function convertCoordToChunk(coord) {
    return Math.floor(coord / 64);
}

function getPlayerChunk(coords) {
    let playerLocation = coords;
    if (playerLocation == null) {
        return null;
    }
    return {
        x: convertCoordToChunk(playerLocation.x),
        y: convertCoordToChunk(playerLocation.y),
        plane: playerLocation.plane
    };
}

//example regions from regions.json
// region is "Misthalin" and zone is "Lumbridge"
// {
//     "Misthalin": {
//         "Lumbridge": [[50, 50]],
//         "Lumbridge Swamp": [[49, 49], [50, 49]],
//         "Al Kharid": [[51, 49]],
//         "Varrock": [[49, 54], [50, 54], [49, 53], [50, 53]],
//         "Draynor Village": [[48, 51], [48, 50]],
//         "Draynor Manor": [[48, 52]],
//         "Wizards' Tower": [[48, 49]],
//         "Barbarian Village": [[48, 53]]
// }, ...

// find the area that the player is in, if any
function getPlayerZone(playerChunk) {
    let playerZone = null;
    let playerLocation = playerChunk;
    if (playerLocation == null) {
        return null;
    }

    console.log("playerLocation: ", playerLocation);
    Object.keys(regions).forEach(region => {
        Object.keys(regions[region]).forEach(zone => {
            const areaArray = regions[region][zone];
            
            // Check if the areaArray is indeed an array
            if (!Array.isArray(areaArray)) {
                console.error(`Expected array for zone '${zone}' in region '${region}', but got:`, areaArray);
                return;
            }

            areaArray.forEach(area => {
                if (playerLocation.x === area[0] && playerLocation.y === area[1]) {
                    playerZone = zone;
                }
            });
        });
    });

    return playerZone;
}




module.exports = {
    updateData,
    checkData,
    getPlayerLocation
}

/* Significant Locations (chunk coordinates)

Note: You can calculate the chunk coordinates by dividing the player's coordiantes by 64 and rounding down. The remainder is how far into the chunk the player is. For example, if the player is at (x: 100, y: 100), the chunk coordinates are (1, 1) and the player is 36% into the chunk.

map link example:

https://maps.runescape.wiki/osrs/#4/0/0/3013/3355
https://maps.runescape.wiki/osrs/#[zoom]/[surface]/[layer]/x/y

more info here: https://runescape.wiki/w/RuneScape:Map
*/

//testing 
// getPlayerLocation("PlizzIronman");