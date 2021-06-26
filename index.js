const gq = require('./services/goquest_service');
var cron = require('node-cron');

let cronStarted = false;
if (!cronStarted) {            

    gq.openConnection();

    // check games every minute
    cron.schedule('* * * * *', () => {

        gq.openConnection();
        
    });

    cronStarted = true;

}