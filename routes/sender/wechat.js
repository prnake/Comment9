const express = require("express");
const router = express.Router();
const { promisify } = require("util");
const auth = require("../../utils/auth");
const audit = require("../../utils/audit");
const logger = require("../../utils/logger");
const redis = require("../../utils/redis");
const Danmaku = require("../../models/danmaku");
const config = require("../../config");
const wechat = require('wechat');

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


setPerms(
    "wechat",
    "permission to connect with wechat"
);

setAddons("wechatAppid", "please set manually", "String", "");
setAddons("wechatAESKey", "please set manually", "String", "");


info.urls = function (activity) {
  const wechatScreenToken = activity.tokens.get("wechatScreen");
  return {
    "wechat_screen_url": `${config.host}${config.rootPath}/#/wall/${activity.id}/wechatScreen/${wechatScreenToken.token}`
  }
}

const init = function (activity) {
  if (!activity.tokens.get("wechat"))
    activity.tokens.set("wechat", { token: auth.genToken(), perms: ["wechat"] });
  if (!activity.tokens.get("wechatScreen"))
    activity.tokens.set("wechatScreen", { token: auth.genToken(), perms: ["pull"] });
}

router.all("/:activity/:name/:token", auth.routerActivityByToken, async function (req, res, next) {
  const activity = req.activity;
  const wechatConfig = {
    token: req.activity_token.token,
    appid: activity.addons.wechatAppid,
    encodingAESKey: activity.addons.wechatAESKey,
    checkSignature: true
  }

  // return res.json({ success: true, danmaku: wechatConfig });

  const middleware = wechat(wechatConfig, function (req, res, next) {
    // 微信输入信息都在req.weixin上
    const message = req.weixin;
    const urls = info.urls(activity);
    logger.info("Got wechat message %o", message);
    if (message.MsgType == "text") {
      let content = '';
      try {
        content = message.Content.toString();
      } catch (e) {
      }
      if (/^[Dd][Mm]/.test(content)) {
        logger.info("Sending wall %s", content.substr(2));
        (async () => {
          // const user_info = await WeChatUser.getWeChatUser(wechatConfig, message.FromUserName);
          // logger.info(user_info);
          // if (!user_info || !user_info.nickname) {
          //   res.reply(`请先发送xm+您的姓名到公众号设置您的姓名`);
          // } else {
          postOne(req, res, { m: user_info.nickname + ":" + content.substr(2), headImg: user_info.headimgurl });
          res.reply('弹幕发送成功');
        })().catch((err) => {
          logger.error(err);
          res.reply('弹幕发送失败, 请稍后再试');
        });
      }
      // } else if (/^[Xx][Mm]/.test(content)) {
      //   WeChatUser.setNickname(wechatConfig, message.FromUserName, content.substr(2)).then(() => {
      //     res.reply("姓名设置成功，您还可以发送图片到公众号以设置您的头像");
      //   }).catch((err) => {
      //     debug(err);
      //     res.reply('姓名设置失败, 请稍后再试');
      //   });
      // } 
      else {
        // res.reply('Name:\n\tcomment9 - 酒井人的弹幕及微信墙\n\n' +
        //   'Usage: \n\t发送xm + 姓名：设置姓名\n\t发送dm + 姓名或者sq + 姓名：我要上墙\n\t发送图片：设置头像\n\n' +
        //   'Made with love of DCSTSAST');
        res.reply('Name:\n\tComment9 - 弹幕墙\n\n' +
          'Usage: \n\t发送dm + 弹幕内容\n\n' +
          `弹幕墙地址: \n\t${urls.wechat_screen_url}\n\n` +
          'Made with love of DCSTSAST');
      }
    }
    // else if (message.MsgType == "image") {
    //   WeChatUser.setHeadImgUrl(wechatConfig, message.FromUserName, message.PicUrl).then(() => {
    //     res.reply("头像设置成功，您还可以发送xm+文字到公众号以设置您的姓名");
    //   }).catch((err) => {
    //     debug(err);
    //     res.reply('头像设置失败, 请稍后再试');
    //   });
    // }
    else {
      res.reply("不支持此类消息");
    }
  });
  return middleware(req, res, next);
});

module.exports = { router, info, init };
