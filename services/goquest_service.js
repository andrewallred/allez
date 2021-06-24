module.exports = { openConnection }

require('dotenv').config()
const WebSocket = require('ws');
const axios = require('axios');
const GoQuestGame = require('../classes/GoQuestGame');
const GoQuestPlayer = require('../classes/GoQuestProfile');

let ws;

async function openConnection() {

    let sessionData = await getSession();
    let sessionKey = sessionData[0];
    let webSocketUrl = 'ws://wars.fm:3002/socket.io/1/websocket/' + sessionKey;
    console.log(webSocketUrl);
    ws = new WebSocket(webSocketUrl);

    ws.on('open', function open() {

        console.log('sending profile request');

        getProfile();

    });

    ws.on('message', function incoming(data) {

        console.log(data);

        let regex = new RegExp('[0-9]*::$');
        let regexResults = regex.exec(data)

        if (regexResults && regexResults.length > 0) {

            // this is a keep alive message

        } else {

            try {

                console.log("casting goQuestGame");

                let gameJson = data.replace('5:::', '');
                let goQuestGame = GoQuestGame.toGoQuestGame(gameJson);

            }
            catch (e) {
                //console.log('exception ' + e)
                console.log('could not cast to goQuestGame');
            }

            let lastGame;
            try {

                console.log("casting goQuestPlayer");

                let playerJson = data.replace('5:::', '');
                let goQuestPlayer = GoQuestPlayer.toGoQuestProfile(playerJson);

                lastGame = goQuestPlayer.args[0].lastGame;

                console.log("last game is");
                console.log(lastGame);

            }
            catch (e) {
                console.log('exception ' + e)
                console.log('could not cast to goQuestPlayer')
            }

            if (lastGame) {
                getGame(lastGame);
            }

        }

    });

}

function getProfile() {

    console.log("getting profile");
    let profileMessage = process.env.GQ_PROFILE_MESSAGE.replace("PROFILE_ID", process.env.GQ_PROFILE_NAME);
    ws.send(profileMessage);

}

function getGame(gameId) {

    console.log("getting game");
    let gameMessage = process.env.GQ_GAME_MESSAGE.replace("GAME_ID", gameId);
    ws.send(gameMessage);

}

async function getSession() {

    let sessionUrl = process.env.GQ_SESSION_URL + +new Date
    console.log(sessionUrl);

    let config = {
        headers: {
            "Pragma": "no-cache",
            "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36",
            "Connection": "keep-alive",
            "Cache-control": "no-cache",
            "Accept": "*/*",
            "Origin": "http://wars.fm",
            "Referer": "http://wars.fm/"
        }
    }

    const results = await axios.get(sessionUrl, config);
    const data = results.data;

    console.log(data);

    return data.split(":");

}