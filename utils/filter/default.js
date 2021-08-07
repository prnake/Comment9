const Danmaku = require('../../models/danmaku');
const logger = require('../../utils/logger');
let info = { perms: [], addons: [] };

const setPerms = (name, description) => info.perms.push({ name: name, description: description });
const setAddons = (name, description, type, def) => info.addons.push({ name: name, description: description, type: type, default: def });

setAddons("limitLength", "limit word length (0 for no-limit)", "Number", 0);

async function filter(danmaku, activity, next) {
    const limitLength = parseInt(activity.addons.limitLength);
    if (limitLength && limitLength < danmaku.text.length)
    {
        return Error("danmaku length more than " + limitLength);
    }
    return await next();
}

module.exports = { filter, info }