const mongodb = require("../utils/mongodb");

const danmakuUserSchema = mongodb.Schema({
    id: String,
    name: String,
    imgurl: String
});

class DanmakuUserClass {
    static async getUser(id) {
        return await this.findOne({ id });
    }

    static async setImgUrl(id, url) {
        let user = await await this.findOne({ id });
        if (!user) {
            user = new this();
            user.id = id;
        }
        user.imgurl = url;
        await user.save();
        return user;
    }

    static async setName(id, name) {
        let user = await await this.findOne({ id });
        if (!user) {
            user = new this();
            user.id = id;
        }
        user.name = name;
        await user.save();
        return user;
    }
}

danmakuUserSchema.loadClass(DanmakuUserClass);
const DanmakuUser = mongodb.model('DanmakuUser', danmakuUserSchema);

module.exports = DanmakuUser;