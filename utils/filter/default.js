const tool = require("../../utils/tool");
const redis = require("../../utils/redis");
const { promisify } = require("util");

const info = function () {
  let data = { perms: [], addons: [] };

  tool.setAddons(
    data.addons,
    "limitLength",
    "limit danmaku length (0 for no-limit)",
    "Number",
    0
  );

  tool.setAddons(
    data.addons,
    "limitFrequency",
    "danmaku send intervals(seconds, 0 for no-limit)",
    "Number",
    0
  );

  return data;
};

async function filter(danmaku, activity, next) {
  const limitLength = parseInt(activity.addons.limitLength);
  const limitFrequency = parseInt(activity.addons.limitFrequency);
  if (limitLength && limitLength < danmaku.text.length) {
    return Error("danmaku length more than " + limitLength);
  }
  if (limitFrequency && limitFrequency > 0) {
    const key = `lock:acitvity:${activity.id}:user:${danmaku.userid}`;
    const ttl = promisify(redis.ttl).bind(redis);
    const time = await ttl(key);
    if (time == -1) redis.setex(key, 0, 1);
    else if (time >= 0) {
      return Error(
        "danmaku send too frequently, please retry after " + time + " seconds"
      );
    } else {
      redis.setex(key, limitFrequency, 1);
    }
  }
  return await next();
}

module.exports = { filter, info };
