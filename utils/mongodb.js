const mongoose = require('mongoose');
const config = require('../config');
const logger = require('./logger');
const db = mongoose.connection;

mongoose.connected = false;
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.connect(`mongodb://${(config.mongodb.username && config.mongodb.password) ? `${config.mongodb.username}:${config.mongodb.password}@` : ''}${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}`, { useNewUrlParser: true, useUnifiedTopology: true });

db.on('open', function () {
    mongoose.connected = true;
});
db.on('error', (e) => {
    logger.error('Mongodb error: ', e);
});
db.once('open', () => {
    logger.info('Mongodb connected');
});

module.exports = mongoose;