const Danmaku = require('../../models/danmaku');
const logger = require('../../utils/logger');
let info = { perms: [], addons: [] };

const setPerms = (name, description) => info.perms.push({ name: name, description: description });
const setAddons = (name, description, type, def) => info.addons.push({ name: name, description: description, type: type, default: def });

setAddons("blacklist", "forbidden user list", "List", []);
setAddons("blackwords", "custom forbidden word list", "List", []);
setAddons("blackwordsDict", "using built-in forbidden word list", "Boolean", false);

const fs = require('fs')
let map = {}
const globalBlacklist = fs.readFileSync(__dirname + '/blackwords.txt', 'utf8').split("\n");

for (let word of globalBlacklist){
    if (word)
        addWord(map, word);
};

function addWord(map, word) {
    let parent = map;
    for (let i = 0; i < word.length; i++) {
        if (!parent[word[i]]) parent[word[i]] = {}
        parent = parent[word[i]]
    }
    parent.isEnd = true
}

function censor(map, s) {
    let parent = map;
    for (let i = 0; i < s.length; i++) {
        if (s[i] == '*') {
            continue
        }

        let found = false
        let skip = 0
        let sWord = ''

        for (let j = i; j < s.length; j++) {

            if (!parent[s[j]]) {
                found = false
                skip = j - i
                parent = map
                break;
            }

            sWord = sWord + s[j]
            if (parent[s[j]].isEnd) {
                found = true
                skip = j - i
                break
            }
            parent = parent[s[j]]
        }

        if (skip > 1) {
            i += skip - 1
        }

        if (!found) {
            continue
        }

        else {
            return sWord;
        }

        // let stars = '*'
        // for (let k = 0; k < skip; k++) {
        //     stars = stars + '*'
        // }

        // let reg = new RegExp(sWord, 'g')
        // s = s.replace(reg, stars)

    }

    return ""

    // return s
}


async function filter(danmaku, activity, next) {
    const blacklist = activity.addons.blacklist;
    if (blacklist instanceof Array && blacklist.includes(danmaku.userid)) {
        return Error("access forbidden");
    }
    if (activity.addons.blackwordsDict) {
        const word = censor(map, danmaku.text);
        if (word.length) {
            return Error("forbidden word "+word);
        }
    }
    if (activity.addons.blackwords instanceof Array) {
        let blackwords = {};
        for (const word of activity.addons.blackwords) {
            addWord(blackwords, word);
        }
        const word = censor(blackwords, danmaku.text);
        if (word.length) {
            return Error("forbidden word " + word);
        }
    }
    return await next();
}

module.exports = { filter, info }