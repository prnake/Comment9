const tool = require("../../utils/tool");

let info = { perms: [], addons: [] };

tool.setAddons(info,"limitLength", "limit word length (0 for no-limit)", "Number", 0);

async function filter(danmaku, activity, next) {
  const limitLength = parseInt(activity.addons.limitLength);
  if (limitLength && limitLength < danmaku.text.length) {
    return Error("danmaku length more than " + limitLength);
  }
  return await next();
}

module.exports = { filter, info };
