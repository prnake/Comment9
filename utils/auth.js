const Activity = require('../models/activity');
const logger = require('../utils/logger');
const crypto = require("crypto");

function routerSessionAuth(req, res, next) {
    if (!req.session.manage_user_id) {
        res.status(403).end();
    } else {
        next();
    }
}

function routerActivityByOwner(req, res, next) {
    const params = Object.assign({}, req.params, req.query, req.body);
    if (!params.activity)
        return res.status(500).end();
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
    const params = Object.assign({}, req.params, req.query, req.body);
    if (!params.activity || !params.name)
        return res.status(500).end();
    if (!params.token) params.token = "";
    Activity.getActivity(params.activity, function (err, activity) {
        if (err) {
            res.status(500).end();
        } else if (!activity) {
            res.json({ success: false, reason: 'activity not exist' });
            res.end();
        } else if (!activity.tokens.get(params.name) || activity.tokens.get(params.name).token !== params.token) {
            res.json({ success: false, reason: 'permission denied' });
            res.end();
        } else {
            req.activity = activity;
            req.activity_token = activity.tokens.get(params.name)
            req.activity_token_name = params.name
            next();
        }
    })
}

function socketActivityByToken(socket, next) {
    const query = Object.assign({}, socket.handshake.auth, socket.handshake.query);
    let activity = query["activity"], tokenName = query["tokenName"], token = query["token"];
    if (!token) token = "";
    if (!activity || !tokenName) {
        next(new Error("Unauthorized"));
        return;
    }
    Activity.getActivity(activity, function (err, activity) {
        if (err || !activity) {
            next(new Error("Unauthorized"));
        } else {
            const activity_token = activity.tokens.get(tokenName);
            if (activity_token === undefined || activity_token.token !== token) {
                next(new Error("Unauthorized"));
            }
            else {
                socket.activity = activity;
                socket.activity_token_name = tokenName;
                socket.activity_token = activity_token;
                next();
            }
        }
    })
}

module.exports = { routerSessionAuth, routerActivityByOwner, routerActivityByToken, socketActivityByToken };