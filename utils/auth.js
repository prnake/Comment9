const Activity = require('../models/activity');
const logger = require('../utils/logger');

function routerSessionAuth(req, res, next) {
    if (!req.session.manage_user_id) {
        res.status(403).end();
    } else {
        next();
    }
}

function routerActivityByOwner(req, res, next) {
    const params = req.method === 'POST' ? req.body : req.params;
    if (!params.activity) res.status(500).end();
    Activity.getActivity(params.activity, function (err, activity) {
        if (err) {
            res.status(500).end();
        } else if (!activity) {
            res.json({ success: false, reason: 'activity not exist' });
            res.end();
        } else if (activity.owner != req.session.manage_user_id) {
            res.json({ success: false, reason: 'permission denied' });
            res.end();
        } else {
            req.activity = activity;
            next();
        }
    })
}

function routerActivityByToken(req, res, next) {
    const params = req.method === 'POST' ? req.body : req.query;
    if (!params.activity || !params.name || !params.token) {
        res.status(500).end();
        return;
    }
    Activity.getActivity(params.activity, function (err, activity) {
        if (err) {
            res.status(500).end();
        } else if (!activity) {
            res.json({ success: false, reason: 'activity not exist' });
            res.end();
        } else if (activity.tokens.get(params.name).token !== params.token) {
            res.json({ success: false, reason: 'permission denied' });
            res.end();
        } else {
            req.activity = activity;
            next();
        }
    })
}

function socketActivityByToken(socket, next) {
    const query = socket.handshake.query;
    const activity = query["acitivity"], tokenName = query["tokenName"], token = query["token"];
    if (!activity || !tokenName) next(new Error("Unauthorized"));
    if (!token) token = "";
    Activity.getActivity(activity, function (err, activity) {
        if (err || !activity) {
            next(new Error("Unauthorized"));
        } else {
            const activity_token = activity.tokens.get(tokenName);
            if (activity_token === undefined || activity_token.token !== token)
                next(new Error("Unauthorized"));
            socket.activity = activity;
            socket.activity_token_name = tokenName;
            socket.activity_token = activity_token;
            next();
        }
    })
}

module.exports = { routerSessionAuth, routerActivityByOwner, routerActivityByToken, socketActivityByToken };