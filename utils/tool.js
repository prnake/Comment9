const setPerms = (info, name, description) =>
    info.perms.push({ name: name, description: description });
const setAddons = (info, name, description, type, def) =>
    info.addons.push({
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

const setPanelTitle = (info, title, description) => {
    info.panel["title"] = title;
    info.panel["description"] = description;
}

const addPanelUrl = (info, name, perms, description, url, type) => {
    if (!info.panel["data"]) info.panel["data"] = [];
    info.panel["data"].push({
        name: name,
        perms: perms,
        description: description,
        url: url,
        type: type
    });
}
   


module.exports = { setPerms, setAddons, genToken, setPanelTitle, addPanelUrl };
