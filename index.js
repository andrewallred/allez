const gq = require('./services/goquest_service');
var cron = require('node-cron');

let cronStarted = false;
if (!cronStarted) {            

    gq.openConnection();

    // check games every three minutes
    cron.schedule('0 */3 * * * *', () => {

        gq.openConnection();
        
    });

    cronStarted = true;

}