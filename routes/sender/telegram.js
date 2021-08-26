const express = require("express");
const router = express.Router();
const auth = require("../../utils/auth");
const logger = require("../../utils/logger");
const { pushDanmaku } = require("./danmaku");
const config = require("../../config");
const TelegramBot = require('node-telegram-bot-api');

let info = { perms: [], addons: [] };

const setPerms = (name, description) =>
    info.perms.push({ name: name, description: description });
const setAddons = (name, description, type, def) =>
    info.addons.push({
        name: name,
        description: description,
        type: type,
        default: def,
    });

setPerms("telegram", "permission to connect with telegram");

setAddons("telegramToken", "please set manually", "String", "");

info.urls = function (activity) {
    const telegramToken = activity.addons.telegramToken;
    const telegramWebhookToken = activity.tokens.get("telegram");
    const telegramScreenToken = activity.tokens.get("telegramScreen");
    const telegram_screen_url = `${config.host}${config.rootPath}/#/wall/${activity.id}/telegramScreen/${telegramScreenToken.token}`;
    const telegram_webhook = `${config.host}${config.rootPath}/telegram/push/${activity.id}/telegram/${telegramWebhookToken.token}`;
    const telegram_webhook_set_url = `https://api.telegram.org/${telegramToken}/setWebhook?url=${telegram_webhook}`;
    return {
        telegram_screen_url: telegram_screen_url,
        telegram_webhook: telegram_webhook,
        telegram_webhook_set_url: telegram_webhook_set_url
    };
};

const init = function (activity) {
    if (!activity.tokens.get("telegram"))
        activity.tokens.set("telegram", {
            token: auth.genToken(),
            perms: ["telegram"],
        });
    if (!activity.tokens.get("telegramScreen"))
        activity.tokens.set("telegramScreen", {
            token: auth.genToken(),
            perms: ["pull"],
        });
};

router.all("/update", auth.routerSessionAuth, auth.routerActivityByOwner, function (req, res) {
    const token = req.activity.addons.telegramToken;
    if(token){
        const bot = new TelegramBot(token);
        console.log(token, info.urls(req.activity).telegram_webhook)
        bot.setWebHook(info.urls(req.activity).telegram_webhook);
    }else{
        res.json({ success: false, reason: "telegram token not set" });
    }
});

router.all(
    "/:activity/:name/:token",
    auth.routerActivityByToken,
    async function (req, res) {
        if (!req.activity_token.perms.includes("telegram")) return res.json({ success: false });
        const activity = req.activity;
        const urls = info.urls(activity);
        const token = activity.addons.telegramToken;
        if (!token) return res.json({ success: false, reason: "telegram token not set" });
        const bot = new TelegramBot(token);
        bot.on('message', msg => {
            let content = msg.text;
            const command = {
                "/dm": 1,
                "/to": 1,
                "/bo": 2,
                "/bs": 4,
                "/ts": 5,
                "/co": 1,
            };
            if (command[content.substr(0, 3).toLowerCase()]) {
                let danmaku = {
                    userid: "telegram:" + msg.chat.username.toString(),
                    username: msg.chat.username.toString(),
                    mode: command[content.substr(0, 3).toLowerCase()],
                    text: content.substr(3).trim(),
                    time: Date.now(),
                };
                if (content.substr(0, 3).toLowerCase() == "/co")
                    danmaku.color = [
                        0xff4500, 0xff8c00, 0xffd700, 0x90ee90, 0x00ced1, 0x1e90ff,
                        0xc71585,
                    ][Math.floor(Math.random() * 7)];
                pushDanmaku(
                    danmaku,
                    activity,
                    req.app.get("socketio"),
                    (err, danmaku) => {
                        if (err) {
                            logger.error(err);
                            bot.sendMessage(msg.chat.id,"弹幕发送失败, 请稍后再试\nFailed to send, please try again later");
                        } else {
                            if (danmaku.status == "publish") bot.sendMessage(msg.chat.id,"弹幕发送成功\nSend successfully");
                            else bot.sendMessage(msg.chat.id,"弹幕发送成功，审核中\nSend successfully, review in progress");
                        }
                    }
                );
            } else if (content.toLowerCase() === "/help") {
                bot.sendMessage(msg.chat.id,
                    "Usage: \n" +
                    `发送弹幕: /dm + 弹幕内容\n` +
                    `顶部弹幕: /ts + 弹幕内容\n` +
                    `底部弹幕: /bs + 弹幕内容\n` +
                    `上端滚动弹幕: /to + 弹幕内容\n` +
                    `下端滚动弹幕: /bo + 弹幕内容\n` +
                    `随机颜色滚动弹幕: /co + 弹幕内容\n` +
                    "\nMade with love by DCSTSAST"
                );
            }
            else if (content.toLowerCase() === "/help_en") {
                bot.sendMessage(msg.chat.id,
                    "Usage: \n" +
                    `Send danmaku: /dm + content\n` +
                    `Top static danmaku: /ts + content\n` +
                    `Bottom static danmaku: /bs + content\n` +
                    `Top scrolling danmaku: /to + content\n` +
                    `Bottom scrolling danmaku: /bo + content\n` +
                    `Scrolling danmaku with random color: /co + content\n` +
                    "\nMade with love by DCSTSAST"
                );
            }
            else {
                bot.sendMessage(msg.chat.id,
                    "Comment9 - 弹幕墙\n\n" +
                    "Usage: \n发送弹幕请输入 /dm + 弹幕内容\n更多帮助请输入 /help\nFor English help please input /help_en\n\n" +
                    `弹幕墙地址: \n${urls.telegram_screen_url}\n\n` +
                    "Made with love by DCSTSAST"
                );
            }
        });
        bot.processUpdate(req.body);
        res.json({ success: true });
    }
);

module.exports = { router, info, init };
