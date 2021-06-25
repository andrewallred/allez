module.exports = { openConnection }

require('dotenv').config()
const WebSocket = require('ws');
const axios = require('axios');
const GoQuestGame = require('../classes/GoQuestGame');
const GoQuestPlayer = require('../classes/GoQuestProfile');
const GoQuestActiveGames = require('../classes/GoQuestActiveGames');

let ws;

async function openConnection() {

    let sessionData = await getSession();
    let sessionKey = sessionData[0];
    let webSocketUrl = 'ws://wars.fm:3002/socket.io/1/websocket/' + sessionKey;
    console.log(webSocketUrl);
    ws = new WebSocket(webSocketUrl);

    ws.on('open', function open() {

        console.log('sending profile request');

        pollActiveGames();

        getProfile();

    });

    ws.on('upgrade', function upgrade(request, socket, head) {

        // console.log("upgrade");
        // console.log(request);
        // console.log(head);

    });


    ws.on('message', function incoming(data) {

        //console.log(data);

        let regex = new RegExp('[0-9]*::$');
        let regexResults = regex.exec(data)

        if (regexResults && regexResults.length > 0) {

            // this is a keep alive message

        } else {

            let goQuestActiveGames;

            try {

                console.log("casting goQuestActiveGames");

                let gamesJson = data.replace('5:::', '');
                goQuestActiveGames = GoQuestActiveGames.toGoQuestActiveGames(gamesJson);

                console.log("success!");

            }
            catch (e) {
                //console.log('exception ' + e)
                console.log('could not cast to goQuestActiveGames');
            }

            if (!goQuestActiveGames) {

                let goQuestGame;
                try {

                    console.log("casting goQuestGame");

                    let gameJson = data.replace('5:::', '');
                    goQuestGame = GoQuestGame.toGoQuestGame(gameJson);

                    console.log("success!");

                    //$("#kif-export-box").val(z(this.model.players, this.model.get("position")));
                    console.log(goQuestGame.args[0].players);
                    console.log(GoQuestGame.toSgf(goQuestGame.args[0].players, goQuestGame.args[0].position));

                }
                catch (e) {
                    console.log('exception ' + e)
                    console.log('could not cast to goQuestGame');
                }

                if (!goQuestGame) {

                    let lastGame;
                    try {

                        console.log("casting goQuestPlayer");

                        let playerJson = data.replace('5:::', '');
                        let goQuestPlayer = GoQuestPlayer.toGoQuestProfile(playerJson);

                        console.log("success!");

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

            }

        }

    });

}

function getProfile() {

    console.log("getting profile");
    let profileMessage = process.env.GQ_PROFILE_MESSAGE.replace("PROFILE_ID", process.env.GQ_PROFILE_NAME);
    console.log("sending message");
    console.log(profileMessage);
    ws.send(profileMessage);

}

function getGame(gameId) {

    console.log("getting game");
    let gameMessage = process.env.GQ_GAME_MESSAGE.replace("GAME_ID", gameId);
    console.log("sending message");
    console.log(gameMessage);
    ws.send(gameMessage);

}

function pollActiveGames() {

    console.log("getting active games");
    console.log("sending message");
    gamesMessage = '5:::{"name":"efa2bd1b","args":[{"env":"WEB","handicapV":"1","gtype":"go9"}]}'
    console.log(gamesMessage);
    ws.send(gamesMessage);

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