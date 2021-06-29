module.exports = { getLibrary, checkIfGameUploaded, uploadSgf }

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

    let saveUrl = 'https://online-go.com/api/v1/me/games/sgf/0';

    const formData = new FormData();

    let file = './games/' + fileName;
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

    for (let i = 0; i < library.games.length; i++) {
        if (library.games[i][6] == gameName || library.games[i][6] == gameName) {
            return true;
        }
    }

    return false;

}