const fs = require('fs');
const axios = require('axios');
const { get } = require('http');

/**
 * Returns the all player's stats and progression if they exist, otherwise null
 * @param {string} username 
 */
async function getPlayerInfo(username) {
    try {
        // Ensure that the username is URL-encoded to handle special characters
        const encodedUsername = encodeURIComponent(username);
        const url = `https://sync.runescape.wiki/runelite/player/${encodedUsername}/STANDARD`;

        // we need to set a user agent to avoid a bad request error
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });
        
        return response.data; // Contains player stats and quest progression
    } catch (error) {
        console.error("Error fetching player data:", error.message);
        // Log more details if available
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
        }
        return null;
    }
}

/**
 * Returns the player's levels if they exist, otherwise null
 * @param {string} username 
 */
async function getPlayerLevels(username) {
    const playerInfo = await getPlayerInfo(username);
    if (playerInfo && playerInfo.levels) {
        let playerLevels = playerInfo.levels;
        console.log(playerLevels);
        return playerLevels;
    } else {
        console.log("No player levels data found for:", username);
        return null;
    }
}

/**
 * Returns the player's quests if they exist, otherwise null
 * @param {string} username
 * @param {number} status 0 = not started, 1 = started, 2 = completed, null = all
 * @returns
 * @async
 * @function
 * @name getPlayerQuests
*/
async function getPlayerQuests(username, status = null) {
    // 0 = not started, 1 = started, 2 = completed
    const playerInfo = await getPlayerInfo(username);
    if (playerInfo && playerInfo.quests) { // Check if player info exists
        let allQuests = Object.keys(playerInfo.quests); // Get all quests
        let playerQuests = allQuests.filter(quest => {
            if (status == null) {
                return true;
            }
            return playerInfo.quests[quest] == status;
        });
        console.log(playerQuests, playerQuests.length);
        return playerQuests;
    }
    console.log("No player quests data found for:", username);
    return null;
}

async function getPlayerQuestsAll(username) { return getPlayerQuests(username); }
async function getPlayerQuestsCompleted(username) { return getPlayerQuests(username, 2); }
async function getPlayerQuestsStarted(username) { return getPlayerQuests(username, 1); }
async function getPlayerQuestsNotStarted(username) { return getPlayerQuests(username, 0); }

async function saveToJson(data) {
    if (!data) {
        console.log("No data to save");
        return;
    }

    // Save JSON object to a tab-formatted JSON file
    fs.writeFile('player.json', JSON.stringify(data, null, '\t'), (err) => {
        if (err) {
            console.error("Error writing to file:", err);
        } else {
            console.log('Data written to file');
        }
    });
}

async function getData() {
    let data = await getPlayerInfo("PlizzIronman");
    await saveToJson(data);
}

// Call the function
getData();
// getPlayerLevels("PlizzIronman");
// getPlayerQuests("PlizzIronman");
// getPlayerQuestsCompleted("PlizzIronman");
// getPlayerQuestsStarted("PlizzIronman");
// getPlayerQuestsNotStarted("PlizzIronman");

// getPlayerQuests("PlizzIronman", 0);
// getPlayerQuests("PlizzIronman", 1);
// getPlayerQuests("PlizzIronman", 2);

module.exports = {
    getPlayerInfo,
    getPlayerLevels,
    getPlayerQuests,
    getPlayerQuestsAll,
    getPlayerQuestsCompleted,
    getPlayerQuestsStarted,
    getPlayerQuestsNotStarted
};
