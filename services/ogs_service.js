module.exports = { getLibrary, checkIfGameUploaded, uploadSgf, downloadLibrary }

require('dotenv').config()
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
let ws;

async function getBearerToken() {

    let tokenUrl = "https://online-go.com/oauth2/token/";

    const formData = new FormData();

    formData.append("client_id", process.env.OGS_CLIENT_ID);
    formData.append("client_secret", process.env.OGS_CLIENT_SECRET);
    formData.append("grant_type", "password");
    formData.append("username", process.env.OGS_USERNAME);
    formData.append("password", process.env.OGS_PASSWORD);

    let config = {
        headers: {
            ...formData.getHeaders(),
            "Content-Length": formData.getLengthSync()
        }
    }

    const results = await axios.post(tokenUrl, formData, config).catch(function (e) {
        console.log("error getting token " + e);
    });

    return "Bearer " + results.data.access_token;

}

async function getLibrary() {

    let libraryUrl = 'https://online-go.com/api/v1/library/USER_ID';
    libraryUrl = libraryUrl.replace("USER_ID", process.env.OGS_USER_ID);

    let bearer = await getBearerToken();
    let config = {
        headers: {
            "Authorization": bearer
        }
    }

    const results = await axios.get(libraryUrl, config).catch(function (e) {
        console.log("error getting library " + e);
    });

    const data = results.data;

    return data;

}

async function uploadSgf(fileName, sgf) {

    let library = await getLibrary();

    let collectionId = 0;
    for (let i = 0; i < library.collections.length; i++) {
        if (library.collections[i][1] == "GoQuest") {
            collectionId = library.collections[i][0];
        }
    }

    let saveUrl = 'https://online-go.com/api/v1/me/games/sgf/' + collectionId;

    const formData = new FormData();

    let gamesFolder = process.env.GAMES_FOLDER;
    if (!(process.env.GAMES_FOLDER)) {
        gamesFolder = './games/';
    }

    console.log("games folder is " + gamesFolder);

    let file = gamesFolder + fileName;
    fs.writeFileSync(file, sgf);
    formData.append("file", fs.createReadStream(file), { knownLength: fs.statSync(file).size });

    let bearer = await getBearerToken();
    let config = {
        headers: {
            ...formData.getHeaders(),
            "Authorization": bearer,
            "Content-Length": formData.getLengthSync()
        }
    }

    const results = await axios.post(saveUrl, formData, config).catch(function (e) {
        console.log("error uploading sgf " + e);
    });
    const data = results.data;

    console.log("done!");

}

async function checkIfGameUploaded(gameName) {

    let library = await getLibrary();

    let collectionId = null;
    for (let i = 0; i < library.collections.length; i++) {
        if (library.collections[i][1] == "GoQuest") {
            collectionId = library.collections[i][0];
        }
    }

    for (let i = 0; i < library.games.length; i++) {
        if (library.games[i][6] == gameName && library.games[i][2] == collectionId) {
            return true;
        }
    }

    return false;

}

async function downloadLibrary() {

    let library = await getLibrary();


    for (let i = 0; i < library.collections.length; i++) {
        if (library.collections[i][1] == "GoQuest") {
            collectionId = library.collections[i][0];
        }
    }

    let count = 0;
    for (let i = 0; i < library.games.length; i++) {
        let path = "./downloads/" + library.games[i][1] + ".json";
        if ((library.games[i][2] == null) && !fs.existsSync(path)) {
            count++;
            //console.log(library.games[i]);
            setTimeout(async function () {
                let game = await getGame(library.games[i][1]);
                data = JSON.stringify(game);
                fs.writeFileSync(path, data);
                console.log(path);
            }, 1010 * count);
        }        
    }

}

async function getGame(id) {

    let gameUrl = 'https://online-go.com/api/v1/games/' + id;

    let bearer = await getBearerToken();
    let config = {
        headers: {
            "Authorization": bearer
        }
    }

    const results = await axios.get(gameUrl, config).catch(function (e) {
        console.log("error getting game " + e);
    });

    const data = results.data;

    return data;

}

// TODO determine if the below methods can be used, current issue is that they return a 401 or 403
async function createGoQuestCollection() {

    let createCollectionUrl = 'https://online-go.com/api/v1/library/USER_ID/collections';
    createCollectionUrl = createCollectionUrl.replace("USER_ID", process.env.OGS_USER_ID);

    console.log(createCollectionUrl);

    let bearer = await getBearerToken();
    let config = {
        headers: {
            "Authorization": bearer
        },
        data: { parent_id: 0, name: "GoQuest", private: 0 }
    }

    const results = await axios.post(createCollectionUrl, config).catch(function (e) {
        console.log("error creating GoQuest collection " + e);
    });

    console.log(results);

    const data = results.data;

    console.log("done!");

    return data.collection_id;

}

async function triggerGameReview(gameId) {

    let triggerReviewUrl = 'https://online-go.com/api/v1/games/GAME_ID/ai_reviews';
    triggerReviewUrl = triggerReviewUrl.replace("GAME_ID", gameId);

    console.log(triggerReviewUrl);

    let bearer = await getBearerToken();
    let config = {
        headers: {
            "Authorization": bearer
        },
        data: { type: "full", engine: "katago" }
    }

    const results = await axios.post(triggerReviewUrl, config).catch(function (e) {
        console.log("error triggering game review " + e);
    });

    console.log(results);

    console.log("done!");

}