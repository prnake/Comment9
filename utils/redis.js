const redis = require('redis');
const { promisify } = require('util');
const config = require('../config');
const logger = require('./logger');

const options = {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
};
if (!options.password) {
    delete options.password;
}
const client = redis.createClient(options);

client.on('error', (e) => {
    logger.error('Redis error: ', e);
});
client.on('connect', () => {
    logger.info('Redis connected');
});

module.exports = client;