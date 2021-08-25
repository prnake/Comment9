const express = require("express");
const router = express.Router();
const { promisify } = require("util");
const auth = require("../../utils/auth");
const audit = require("../../utils/audit");
const logger = require("../../utils/logger");
const redis = require("../../utils/redis");
const Danmaku = require("../../models/danmaku");
const config = require("../../config");
// const io = require("socket.io")();

let info = { perms: [], addons: [] };

const setPerms = (name, description) =>
  info.perms.push({ name: name, description: description });
// const setAddons = (name, description, type, def) =>
//   info.addons.push({
//     name: name,
//     description: description,
//     type: type,
//     default: def,
//   });

setPerms("pull", "permission to pull recent danmaku");
setPerms("push", "permission to push danmaku for single user");
setPerms(
  "pushmult",
  "permission to push danmaku for multi-users(customize userid)"
);
setPerms("audit", "permission to audit danmaku");

const init = function (activity) {
  if (!activity.tokens.get("screen"))
    activity.tokens.set("screen", { token: auth.genToken(), perms: ["pull"] });
  if (!activity.tokens.get("user"))
    activity.tokens.set("user", {
      token: auth.genToken(),
      perms: ["pull", "push"],
    });
  if (!activity.tokens.get("audit"))
    activity.tokens.set("audit", {
      token: auth.genToken(),
      perms: ["pull", "push", "audit"],
    });
};

router.get("/pull", auth.routerActivityByToken, async function (req, res) {
  const keysAsync = promisify(redis.keys).bind(redis);
  const getAsync = promisify(redis.get).bind(redis);
  const keys = await keysAsync(`acitvity:${req.activity.id}:danmaku:*`);
  if (!keys) {
    res.json({ success: false, reason: "unkown error" });
  } else {
    const danmaku = await Promise.all(
      keys.map(async (key) => JSON.parse(await getAsync(key)))
    );
    res.json({ success: true, danmaku: danmaku });
  }
});

router.get("/config", auth.routerActivityByToken, async function (req, res) {
  res.json({ success: true, data: { name: req.activity.name } });
});

router.get("/url", async function (req, res) {
  const params = req.method === "POST" ? req.body : req.query;
  let url = {};
  const info = {
    host: config.host + config.rootPath + "/danmaku",
    query: {
      acitivity: params.activity,
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
  Danmaku.createDanmaku(data, activity.id, function (err, danmaku) {
    if (err) {
      logger.error(err);
      callback(new Error("danmaku creat error"));
    } else {
      audit.filters(danmaku, activity, function (autherr) {
        if (autherr) {
          callback(new Error(autherr.message));
        } else {
          if (danmaku.status === "publish") {
            io.of(config.rootPath + "/danmaku")
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
