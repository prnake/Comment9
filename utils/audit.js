const Activity = require('../models/activity');
const logger = require('../utils/logger');

function compose(middleware) {
    if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
    for (const fn of middleware) {
        if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!');
    }
    return function (danmaku, activity) {
        const next = () => {
            const fn = middleware.shift();
            if (fn) {
                return Promise.resolve(fn(danmaku, activity, next));
            } else {
                return Promise.resolve();
            }
        }
        return next();
    }
}

function filters(danmaku, activity, callback) {
    let middleware = [];
    for (const name of activity.filters)
        middleware.push(require("./filter/" + name).filter);
    compose(middleware)(danmaku, activity).then(function (err) {
        if (err) {
            logger.error(err.message);
            danmaku.updateStatus({status: "reject"}, function () { callback(err) });
        }
        else {
            if (activity.audit) {
                danmaku.updateStatus({ status: "audit" }, function () { callback(null) });
            } else {
                danmaku.updateStatus({ status: "publish" }, function () { callback(null) });
            }
        }
    });
}

module.exports = { filters };