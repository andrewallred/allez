const gq = require('./services/goquest_service');
var cron = require('node-cron');

// let cronStarted = false;
// if (!cronStarted) {


// check games every minute
// cron.schedule('0 */3 * * * *', () => {

// gq.openConnection();

// });

// cronStarted = true;

// }
exports.handler = (event, context, callback) => {
  gq.openConnection(callback);
};
