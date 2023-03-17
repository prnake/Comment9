const express = require("express");
const router = express.Router();
const { promisify } = require("util");
const auth = require("../../utils/auth");
const audit = require("../../utils/audit");
const logger = require("../../utils/logger");
const redis = require("../../utils/redis");
const Danmaku = require("../../models/danmaku");
const config = require("../../config");
const tool = require("../../utils/tool");

const info = function (activity) {
  let data = { perms: [], addons: [], panel: {} };

  tool.setPerms(data.perms, "protect", "only token can be edit");
  tool.setPerms(data.perms, "pull", "permission to pull recent danmaku");
  tool.setPerms(
    data.perms,
    "push",
    "permission to push danmaku for single user"
  );
  tool.setPerms(
    data.perms,
    "pushmult",
    "permission to push danmaku for multi-users(customize userid)"
  );
  tool.setPerms(data.perms, "audit", "permission to audit danmaku");

  tool.setAddons(
    data.addons,
    "defaultDanmakuColor",
    "default danmaku color",
    "String",
    "#000000"
  );

  tool.setAddons(data.addons, "streamUrl", "streaming url", "String", "");

  tool.setAddons(
    data.addons,
    "streamType",
    "streaming type(hls or empty)",
    "String",
    ""
  );

  tool.setAddons(
    data.addons,
    "sign",
    "sign",
    "String",
    "Made with love by Comment9"
  );

  tool.setPanelTitle(
    data.panel,
    "Danmaku Address",
    "These are basic urls used for web and danmaQ."
  );

  // const danmaq_info = {
  //   host: config.host + config.rootPath + "/danmaku",
  //   query: { activity: activity.id, tokenName: "screen", token: activity.tokens.get("screen").token },
  // };

  tool.addPanelItem(
    data.panel,
    "DanmaQ Address",
    ["pull"],
    "Copy to the address bar in danmaQ.",
    config.host + config.rootPath,
    "copy"
  );
  tool.addPanelItem(
    data.panel,
    "DanmaQ Channel",
    ["pull"],
    "This is the name of this activity.",
    activity.name,
    "copy"
  );
  tool.addPanelItem(
    data.panel,
    "DanmaQ Name",
    ["pull"],
    'You can use any other token with perm "pull".',
    "screen",
    "copy"
  );
  tool.addPanelItem(
    data.panel,
    "DanmaQ Token",
    ["pull"],
    'This is the value of "screen" token.',
    activity.tokens.get("screen").token,
    "copy"
  );

  tool.addPanelItem(
    data.panel,
    "Danmaku Wall",
    ["pull"],
    "",
    `${config.host}${config.rootPath}/#/wall/${activity.id}/screen/${
      activity.tokens.get("screen").token
    }`,
    "open"
  );
  tool.addPanelItem(
    data.panel,
    "Danmaku List Wall",
    ["pull"],
    "",
    `${config.host}${config.rootPath}/#/list/${activity.id}/screen/${
      activity.tokens.get("screen").token
    }`,
    "open"
  );
  tool.addPanelItem(
    data.panel,
    "Danmaku Stream Player",
    ["pull"],
    activity.addons.streamUrl ? "" : 'Please set "streamUrl" first.',
    activity.addons.streamUrl
      ? `${config.host}${config.rootPath}/#/player/${activity.id}/screen/${
          activity.tokens.get("screen").token
        }`
      : "",
    "open"
  );
  tool.addPanelItem(
    data.panel,
    "Danmaku Web Sender",
    ["pull", "push"],
    "",
    `${config.host}${config.rootPath}/#/Sender/${activity.id}/user/${
      activity.tokens.get("user").token
    }`,
    "open"
  );
  tool.addPanelItem(
    data.panel,
    "Danmaku Audit",
    ["pull", "push", "audit"],
    "",
    `${config.host}${config.rootPath}/#/Audit/${activity.id}/audit/${
      activity.tokens.get("audit").token
    }`,
    "open"
  );

  return data;
};

const init = function (activity) {
  if (!activity.tokens.get("screen"))
    activity.tokens.set("screen", {
      token: tool.genToken(),
      perms: ["pull", "protect"],
    });
  if (!activity.tokens.get("user"))
    activity.tokens.set("user", {
      token: tool.genToken(),
      perms: ["pull", "push", "protect"],
    });
  if (!activity.tokens.get("audit"))
    activity.tokens.set("audit", {
      token: tool.genToken(),
      perms: ["pull", "push", "audit", "protect"],
    });
  activity.addons["streamType"] = "hls";
  activity.addons["sign"] = "Made with love by Comment9";
  activity.markModified("addons");
};

router.get("/pull", auth.routerActivityByToken, async function (req, res) {
  const params = Object.assign({}, req.params, req.query, req.body);
  const keysAsync = promisify(redis.keys).bind(redis);
  const getAsync = promisify(redis.get).bind(redis);
  const keys = await keysAsync(`acitvity:${req.activity.id}:danmaku:*`);
  if (!params.start_id) {
    params.start_id = 0;
  }
  if (!keys) {
    res.json({ success: false, reason: "unkown error" });
  } else {
    const danmaku = await Promise.all(
      keys.map(async (key) => JSON.parse(await getAsync(key)))
    );
    res.json({
      success: true, danmaku: danmaku.filter((item) => item.id >= params.start_id) });
  }
});

router.get("/config", auth.routerActivityByToken, async function (req, res) {
  res.json({
    success: true,
    data: {
      name: req.activity.name,
      video_url: req.activity.addons.streamUrl,
      video_type: req.activity.addons.streamType,
    },
  });
});

router.get("/url", async function (req, res) {
  const params = req.method === "POST" ? req.body : req.query;
  let url = {};
  const info = {
    host: config.host + config.rootPath + "/danmaku",
    query: {
      activity: params.activity,
      tokenName: params.name,
      token: params.token,
    },
  };
  url.danmaQ =
    "danmaQ://" + Buffer.from(JSON.stringify(info)).toString("base64");
  res.json({ success: true, url: url });
});

const pushDanmaku = function (data, activity, io, callback) {
  if (!callback) {
    callback = function () {};
  }
  Danmaku.createDanmaku(data, activity, function (err, danmaku) {
    if (err) {
      logger.error(err);
      callback(new Error("danmaku creat error"));
    } else {
      audit.filters(danmaku, activity, function (autherr) {
        if (autherr) {
          callback(new Error(autherr.message));
        } else {
          if (danmaku.status === "publish") {
            io.of("/danmaku")
              .to(activity.id)
              .emit("danmaku", danmaku.toJSON());
            redis.setex(
              `acitvity:${activity.id}:danmaku:${danmaku.id}`,
              config.danmaku.expire,
              JSON.stringify(danmaku)
            );
          } else if (danmaku.status === "audit")
            redis.sadd(
              `acitvity:${activity.id}:audit`,
              `${JSON.stringify(danmaku)}`
            );
          callback(null, danmaku);
        }
      });
    }
  });
};

const socket = function (io, path) {
  io.of(path)
    .use((socket, next) => {
      auth.socketActivityByToken(socket, next);
    })
    .on("connection", async function (socket) {
      const activity = socket.activity;
      if (!activity.senders.includes("danmaku")) socket.close();

      const address =
          socket.handshake.headers["x-real-ip"] || socket.handshake.address,
        nspName = socket.nsp.name;
      logger.info(
        "New socket connection from " +
          address +
          " to " +
          nspName +
          " on activity " +
          activity.name +
          " with token of " +
          socket.activity_token_name
      );

      const perms = new Set(socket.activity_token.perms);

      if (perms.has("pull")) {
        socket.join(activity.id);
        redis.keys(`acitvity:${activity.id}:danmaku:*`, function (err, res) {
          if (!err && res) {
            res.map((key) =>
              redis.get(key, (err, res) => {
                if (!err) {
                  socket.emit("danmaku", JSON.parse(res));
                }
              })
            );
          }
        });
      }

      if (perms.has("push") || perms.has("pushmult")) {
        socket.on("push", function (data) {
          data.time = Date.now();
          if (!perms.has("pushmult") || !data.userid)
            data.userid = "ip:" + address;
          pushDanmaku(data, activity, io, function (err, danmaku) {
            if (err) {
              socket.emit("message", err.message);
            } else {
              socket.emit("push", danmaku.status);
            }
          });
        });
      }

      if (perms.has("audit")) {
        socket.on("get audit list", function (data) {
          const count = parseInt(data) || 5;
          if (count > 20 || count <= 0) {
            socket.emit("message", "invalid count");
          } else {
            redis.spop(
              `acitvity:${activity.id}:audit`,
              count,
              function (err, res) {
                if (err || !res) socket.emit("message", "nothing to audit");
                else {
                  socket.emit(
                    "get audit list",
                    res.map((i) => JSON.parse(i))
                  );
                }
              }
            );
          }
        });

        socket.on("set audit status", function (data) {
          if (!data.id || !data.status) {
            socket.emit("message", "missing parameter");
          } else if (["reject", "draft", "publish"].includes(data.status)) {
            const lockKey = `lock:acitvity:${activity.id}:danmaku:${data.id}`; //避免被重入
            redis.setnx(lockKey, 1, (err, res) => {
              if (!err && res) {
                redis.expire(lockKey, 10, function () {
                  Danmaku.getDanmaku(data.id, function (err, danmaku) {
                    if (err || danmaku.activity != activity.id) {
                      socket.emit("message", "unknown error");
                    } else if (danmaku.status === data.status) {
                      socket.emit("message", "same status");
                    } else {
                      danmaku.updateStatus(data, function (err) {
                        if (err) {
                          socket.emit("message", "unknown error");
                        } else {
                          if (danmaku.status === "publish") {
                            socket.emit("danmaku", danmaku.toJSON());
                            socket
                              .to(activity.id)
                              .emit("danmaku", danmaku.toJSON());
                            redis.setex(
                              `acitvity:${activity.id}:danmaku:${danmaku.id}`,
                              config.danmaku.expire,
                              JSON.stringify(danmaku)
                            );
                          }
                          socket.emit("set audit status", danmaku.status);
                          redis.del(lockKey);
                        }
                      });
                    }
                  });
                });
              } else {
                socket.emit("message", "too many request");
              }
            });
          } else {
            socket.emit("message", "invalid status");
          }
        });
      }
    });
};

module.exports = { router, socket, info, init, pushDanmaku };
