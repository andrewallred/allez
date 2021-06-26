module.exports = { openConnection }

require('dotenv').config()
const WebSocket = require('ws');
const axios = require('axios');
const cron = require('node-cron');
const ogs = require('../services/ogs_service');
const GoQuestGame = require('../classes/go-quest-game');
const GoQuestPlayer = require('../classes/go-quest-profile');
const GoQuestActiveGames = require('../classes/go-quest-active-games');

let ws;

let cronStarted = false;
async function openConnection() {

    let sessionData = await getSession();
    let sessionKey = sessionData[0];
    let webSocketUrl = 'ws://wars.fm:3002/socket.io/1/websocket/' + sessionKey;
    console.log(webSocketUrl);
    ws = new WebSocket(webSocketUrl);

    ws.on('open', function open() {

        console.log('sending profile request');

        pollActiveGames();

        if (!cronStarted) {

            getProfile();

            // check games every minute
            cron.schedule('* * * * *', () => {
                getProfile();
            });

            cronStarted = true;
        }

    });

    // TBD if needed
    // ws.on('close', function clear() {
    //     //process.exit(1);
    // });

    ws.on('message', async function incoming(data) {

        //console.log(data);

        let regex = new RegExp('[0-9]*::$');
        let regexResults = regex.exec(data)

        if (regexResults && regexResults.length > 0) {

            // this is a keep alive message and can be ignored

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

                    console.log("success casting to goQuestGame!");

                    let sgfAlreadyUploaded = await ogs.checkIfGameUploaded(goQuestGame.args[0].id);
                    if (!sgfAlreadyUploaded) {

                        console.log("uploading sgf for game " + goQuestGame.args[0].id);

                        try {
                            
                            let sgf = GoQuestGame.toSgf(goQuestGame.args[0].players, goQuestGame.args[0].position, goQuestGame.args[0].gtype);
                            console.log(sgf);
                            await ogs.uploadSgf(goQuestGame.args[0].id, sgf);                            

                        } catch (e) {
                            console.log(e);
                        }

                    } else {
                        console.log("game already uploaded");
                    }                    

                }
                catch (e) {
                    //console.log('exception ' + e)
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

    const results = await axios.get(sessionUrl, config).catch(function (e) {
        console.log("error getting session " + e);
    });;
    const data = results.data;

    console.log(data);

    return data.split(":");

}