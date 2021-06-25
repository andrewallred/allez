module.exports = { getLibrary }

require('dotenv').config()
const axios = require('axios');
const OgsLibrary = require('../classes/OgsLibrary');

let ws;

async function getLibrary() {

    let libraryUrl = process.env.OGS_LIBRARY_URL.replace("USER_ID", process.env.OGS_USER_ID);
    console.log(libraryUrl);

    let config = {
        headers: {
            "Authorization": process.env.OGS_BEARER
        }
    }

    const results = await axios.get(libraryUrl, config);
    const data = results.data;

    console.log(data);

}