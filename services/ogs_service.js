module.exports = { getLibrary, checkIfGameUploaded, uploadSgf }

require('dotenv').config()
const axios = require('axios');
const FormData = require('form-data');
const Readable = require("stream");
const fs = require('fs');
let ws;

async function getLibrary() {

    let libraryUrl = process.env.OGS_LIBRARY_URL.replace("USER_ID", process.env.OGS_USER_ID);

    let config = {
        headers: {
            "Authorization": process.env.OGS_BEARER
        }
    }

    const results = await axios.get(libraryUrl, config).catch(function (e) {
        console.log("error getting library " + e);
    });

    const data = results.data;

    return data;

}

async function uploadSgf(fileName, sgf) {

    let saveUrl = process.env.OGS_SAVE_SGF_URL;

    const formData = new FormData();

    let file = './games/' + fileName + '.sgf';
    fs.writeFileSync(file, sgf);
    formData.append("file", fs.createReadStream(file), { knownLength: fs.statSync(file).size });

    let config = {
        headers: {
            ...formData.getHeaders(),
            "Authorization": process.env.OGS_BEARER,
            "Content-Length": formData.getLengthSync()
        }
    }

    const results = await axios.post(saveUrl, formData, config).catch(function (e) {
        console.log("error uploading sgf " + e);
    });;
    const data = results.data;

    console.log("done!");

}

async function checkIfGameUploaded(gameName) {

    let library = await getLibrary();

    for (let i = 0; i < library.games.length; i++) {
        //console.log(library.games[i][6]);
        if (library.games[i][6] == gameName || library.games[i][6] == gameName + '.sgf') {
            return true;
        }
    }

    return false;

}