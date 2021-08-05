const express = require('express');
const router = express.Router();
const config = require('../config');
const User = require('../models/user');

router.post('/login', function (req, res) {
    const post = req.body;
    User.userLogin(post.user, post.password, function (err, success, uid) {
        if (err) {
            res.status(500).end();
        }
        else if (!success) {
            res.json({ success: false, reason: 'wrong user/password' });
        }
        else {
            req.session.manage_user_id = uid;
            res.json({ success: true });
        }
    });
});

router.post('/reg', function (req, res) {
    var post = req.body;
    if (post.user && post.password && /\w+/.test(post.user)) {
        User.createUser(post.user, post.password, function (err, uid) {
            res.json({ success: err === null });
        });
    } else {
        res.json({ success: false, reason: 'invalid user/password' });
    }
});

router.get('/logout', function (req, res) {
    delete req.session.manage_user_id;
    res.json({ success: true });
});

module.exports = router;