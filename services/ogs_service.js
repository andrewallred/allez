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

    const results = await axios.get(libraryUrl, config);
    const data = results.data;

    return data;

}

async function uploadSgf(sgf) {

    let saveUrl = process.env.OGS_SAVE_SGF_URL;

    const formData = new FormData();

    // // Append any files to the request
    //formData.append("file", chunk, { knownLength: chunk.length });
    //let binary = stringToBinary(sgf);
    //formData.append("file", binary, { knownLength: binary.length });

    let file = "./games/game.sgf";
    formData.append("file", fs.createReadStream(file), { knownLength: fs.statSync(file).size });

    let config = {
        headers: {
            ...formData.getHeaders(),
            "Authorization": process.env.OGS_BEARER,
            "Content-Length": formData.getLengthSync()
        }
    }

     const results = await axios.post(saveUrl, formData, config);
     const data = results.data;

     console.log("done!");
     console.log(results);

}

function stringToBinary(input) {
    var characters = input.split('');
  
    return characters.map(function(char) {
      const binary = char.charCodeAt(0).toString(2)
      const pad = Math.max(8 - binary.length, 0);
      // Just to make sure it is 8 bits long.
      return '0'.repeat(pad) + binary;
    }).join('');
  }

async function checkIfGameUploaded(gameName) {

    let library = await getLibrary();

    for (let i = 0; i < library.games.length; i++) {
        //console.log(library.games[i][6]);
        if (library.games[i][6] == gameName) {
            return true;
        }
    }

    return false;

}