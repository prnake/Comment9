const express = require("express");
const router = express.Router();
const auth = require("../../utils/auth");
const logger = require("../../utils/logger");
const { pushDanmaku } = require("./danmaku");
const tool = require("../../utils/tool");
const config = require("../../config");
const wechat = require("wechat");

let info = { perms: [], addons: [], panel: {} };

tool.setPerms(info,"wechat", "permission to connect with wechat");

tool.setAddons(info,"wechatToken", "please set manually", "String", "");
tool.setAddons(info,"wechatAppid", "please set manually", "String", "");
tool.setAddons(info,"wechatAESKey", "please set manually", "String", "");

info.urls = function (activity) {
  const wechatScreenToken = activity.tokens.get("wechatScreen");
  return {
    wechat_screen_url: `${config.host}${config.rootPath}/#/wall/${activity.id}/wechatScreen/${wechatScreenToken.token}`,
  };
};

const init = function (activity) {
  if (!activity.tokens.get("wechat"))
    activity.tokens.set("wechat", {
      token: tool.genToken(),
      perms: ["wechat"],
    });
  if (!activity.tokens.get("wechatScreen"))
    activity.tokens.set("wechatScreen", {
      token: tool.genToken(),
      perms: ["pull"],
    });
};

router.all(
  "/:activity/:name/:token",
  auth.routerActivityByToken,
  async function (req, res) {
    if (!req.activity_token.perms.includes("wechat")) return res.json({ success: false });
    const activity = req.activity;
    const wechatConfig = {
      token: activity.addons.wechatToken,
      appid: activity.addons.wechatAppid,
      encodingAESKey: activity.addons.wechatAESKey,
      checkSignature: true,
    };

    // return res.json({ success: true, danmaku: wechatConfig });

    const middleware = wechat(wechatConfig, function (req, res) {
      // 微信输入信息都在req.weixin上
      const message = req.weixin;
      const urls = info.urls(activity);
      logger.info("Got wechat message %o", message);
      if (message.MsgType == "text") {
        let content = message.Content.toString();
        const command = {
          dm: 1,
          to: 1,
          bo: 2,
          bs: 4,
          ts: 5,
          co: 1,
        };
        if (command[content.substr(0, 2).toLowerCase()]) {
          let danmaku = {
            userid: "wechat:" + message.FromUserName.toString(),
            mode: command[content.substr(0, 2).toLowerCase()],
            text: content.substr(2).trim(),
            time: Date.now(),
          };
          if (content.substr(0, 2).toLowerCase() == "co")
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
                res.reply("弹幕发送失败, 请稍后再试");
              } else {
                if (danmaku.status == "publish") res.reply("弹幕发送成功");
                else res.reply("弹幕发送成功，审核中");
              }
            }
          );
        } else if (content.toLowerCase() === "help") {
          res.reply(
            "Usage: \n" +
              `发送弹幕: dm + 弹幕内容\n` +
              `顶部弹幕: ts + 弹幕内容\n` +
              `底部弹幕: bs + 弹幕内容\n` +
              `上端滚动弹幕: to + 弹幕内容\n` +
              `下端滚动弹幕: bo + 弹幕内容\n` +
              `随机颜色滚动弹幕: co + 弹幕内容\n` +
              "\nMade with love by DCSTSAST"
          );
        }

        // const user_info = await WeChatUser.getWeChatUser(wechatConfig, message.FromUserName);
        // logger.info(user_info);
        // if (!user_info || !user_info.nickname) {
        //   res.reply(`请先发送xm+您的姓名到公众号设置您的姓名`);
        // } else {
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
          res.reply(
            "Comment9 - 弹幕墙\n\n" +
              "Usage: \n发送弹幕请输入 dm + 弹幕内容\n更多帮助请输入 help\n\n" +
              `弹幕墙地址: \n${urls.wechat_screen_url}\n\n` +
              "Made with love by DCSTSAST"
          );
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
    return middleware(req, res);
  }
);

module.exports = { router, info, init };
