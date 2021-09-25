const mongodb = require("../utils/mongodb");
const logger = require("../utils/logger");
const counter = require("./counter");
const tinycolor = require("tinycolor2");

const danmakuSchema = mongodb.Schema(
  {
    id: { type: Number, index: true },
    userid: { type: String }, // 发送者id
    username: { type: String }, // 发送者昵称
    userimg: { type: String, default: "" }, // 发送者头像
    mode: { type: Number, default: 1 }, // 模式
    text: { type: String }, // 内容
    dur: { type: Number, default: 4000 }, // 持续时间
    size: { type: Number, default: 25 }, // 文字大小
    color: { type: Number, default: 0x000000 }, // 文字颜色
    time: { type: Number }, // 发送时间
    status: {
      type: String,
      enum: ["draft", "audit", "publish", "reject"],
      default: "draft",
    },
    activity: {
      type: mongodb.Schema.Types.ObjectId,
      ref: "Activity",
      index: true,
    }, // 活动id
    addons: { type: Map, of: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

danmakuSchema.statics.createDanmaku = function (config, activity, callback) {
  const activity_id = activity.id;
  if (!callback) {
    callback = function () {};
  }
  if (!config.mode || !config.userid || !config.text || !config.time) {
    callback(new Error("missing params"));
    return;
  }
  counter(`activity:${activity_id}:danmaku:count`);
  counter(`danmaku:count`, function (err, id) {
    if (err) {
      callback("unknown error");
      return;
    } else {
      const item = new Danmaku({
        id: id,
        userid: config.userid,
        username: config.username || config.userid,
        userimg: config.userimg,
        mode: config.mode,
        text: config.text,
        dur: config.dur,
        size: config.size,
        color: config.color ? config.color : parseInt(tinycolor(activity.addons.defaultDanmakuColor).toHexString().slice(1), 16),
        time: config.time,
        status: "draft",
        activity: activity_id,
        addons: config.addons,
      });
      item.save(function (err) {
        if (err) logger.error(err);
        callback(err, item);
      });
    }
  });
};

danmakuSchema.methods.updateStatus = function (data, callback) {
  if (!callback) {
    callback = function () {};
  }
  this.status = data.status;
  if (data.star) {
    this.addons.set("star", true);
    this.addons.set("border", true);
  }
  this.save(callback);
};

danmakuSchema.statics.getDanmaku = function (id, callback) {
  if (!callback) {
    callback = function () {};
  }
  Danmaku.findOne({ id: id }, callback);
};

danmakuSchema.statics.getAllDanmaku = function (activity_id, callback) {
  if (!callback) {
    callback = function () {};
  }
  Danmaku.find({ activity: activity_id }, callback);
};

danmakuSchema.statics.getAllDanmakuText = function (activity_id, callback) {
  if (!callback) {
    callback = function () {};
  }
  Danmaku.find({ activity: activity_id, status: "publish" }, "text", callback);
};

const Danmaku = mongodb.model("Danmaku", danmakuSchema);

module.exports = Danmaku;
