const tool = require("../../utils/tool");

const info = function () {
  let data = { perms: [], addons: [] };

  tool.setAddons(
    data.addons,
    "limitLength",
    "limit danmaku length (0 for no-limit)",
    "Number",
    0
  );

  return data;
};

async function filter(danmaku, activity, next) {
  const limitLength = parseInt(activity.addons.limitLength);
  if (limitLength && limitLength < danmaku.text.length) {
    return Error("danmaku length more than " + limitLength);
  }
  return await next();
}

module.exports = { filter, info };
