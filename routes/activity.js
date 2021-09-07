const express = require('express');
const router = express.Router();
const Activity = require('../models/activity');
const auth = require('../utils/auth');
const config = require('../config')

router.get('/list', auth.routerSessionAuth, function (req, res) {
    Activity.findByOwner(req.session.manage_user_id, function (err, data) {
        if (err)
            res.json({ success: false, reason: 'unknown error' });
        else
            res.json({ success: true, activities: data });
    })
});

router.post('/new', auth.routerSessionAuth, function (req, res) {
    if (!req.body.name)
        res.json({ success: false, reason: 'invalid name' });
    else {
        Activity.createActivity(req.body.name, req.session.manage_user_id , function (err, _id) {
            if (err) {
                res.json({ success: false, reason: 'duplicate names' });
            }
            else {
                res.json({ success: true, id: _id });
            }
        });
    }
});

router.post('/delete', auth.routerSessionAuth, auth.routerActivityByOwner, function (req, res) {
    req.activity.remove(function (err) {
        res.json({ success: !err });
    })
});

router.post('/config', auth.routerSessionAuth, auth.routerActivityByOwner, function (req, res) {
    const info = [];
    const activity = req.activity;
    const data = activity.toJSON();
    
    data.permList = [];
    data.addonList = [];
    data.panelList = [];
    data.senderList = config.danmaku.senders;
    data.filterList = config.danmaku.filters;

    for (const name of activity.senders) {
        info.push(require("./sender/" + name).info(activity));
    }

    for (const name of activity.filters) {
        info.push(require("../utils/filter/" + name).info(activity));
    }

    info.filter(item => item.perms).map(item => data.permList.push(...item.perms));
    info.filter(item => item.addons).map(item => data.addonList.push(...item.addons));
    info.filter(item => item.panel && Object.keys(item.panel).length).map(item => data.panelList.push(item.panel));
        
    res.json({ success: true, data: data });
});

router.post('/set', auth.routerSessionAuth, auth.routerActivityByOwner, function (req, res) {
    switch (req.body.method) {
        case 'updateInfo':
            req.activity.updateInfo(req.body, function (err) {
                res.json({ success: !err });
            });
            break;
        case 'updateName':
            if (!req.body.name)
                res.json({ success: false, reason: 'invalid name' });
            req.activity.updateName(req.body.name, function (err) {
                if (err) {
                    res.json({ success: false, reason: 'duplicate names' });
                }
                else {
                    res.json({ success: true });
                }
            });
            break;
        case 'setAudit':
            req.activity.setAudit(req.body.audit, function (err) {
                res.json({ success: !err });
            });
            break;
        case 'setToken':
            req.activity.setToken(req.body.name, req.body.token, req.body.perms, function (err) {
                res.json({ success: !err });
            });
            break;
        case 'setSenders':
            req.activity.setSenders(req.body.senders, function (err) {
                res.json({ success: !err });
            });
            break;
        case 'setFilters':
            req.activity.setFilters(req.body.filters, function (err) {
                res.json({ success: !err });
            });
            break;
        case 'delToken':
            req.activity.delToken(req.body.name, function (err) {
                res.json({ success: !err });
            });
            break;
        case 'setAddon':
            req.activity.setAddon(req.body.name, req.body.value, function (err) {
                res.json({ success: !err });
            });
            break;
        case 'delAddon':
            req.activity.delAddon(req.body.name, function (err) {
                res.json({ success: !err });
            });
            break;
        default:
            res.json({ success: false, reason: "method not found" });
    }
});

module.exports = router;