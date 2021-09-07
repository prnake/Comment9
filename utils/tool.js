const crypto = require('crypto');
const setPerms = (perms, name, description) =>
    perms.push({ name: name, description: description });
const setAddons = (addons, name, description, type, def) =>
    addons.push({
        name: name,
        description: description,
        type: type,
        default: def,
    });
const genToken = function () {
    let hash = crypto.createHash("sha1");
    hash.update(crypto.randomBytes(32));
    hash.update("t" + new Date().getTime());
    return hash.digest("hex");
};

const setPanelTitle = (panel, title, description) => {
    panel["title"] = title;
    panel["description"] = description;
}

const addPanelItem = (panel, name, perms, description,url,type) => {
    if (!panel["items"]) panel["items"] = [];
    panel["items"].push({
        name: name,
        perms: perms,
        description: description,
        url: url,
        type: type
    });
}

module.exports = { setPerms, setAddons, genToken, setPanelTitle, addPanelItem };
