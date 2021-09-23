const config = require("../../config");
const express = require("express");
const router = express.Router();
const tool = require("../../utils/tool");
const auth = require("../../utils/auth");
const Danmaku = require("../../models/danmaku");

const info = function (activity) {
  let data = { panel: {} };

  tool.setPanelTitle(data.panel, "Danmaku Export", "");
  tool.addPanelItem(
    data.panel,
    "JSON",
    [],
    "",
    `${config.host}${config.rootPath}/export/danmaku.json?activity=${activity.id}`,
    "download"
  );
  tool.addPanelItem(
    data.panel,
    "TEXT",
    [],
    "",
    `${config.host}${config.rootPath}/export/danmaku.txt?activity=${activity.id}`,
    "download"
  );
  return data;
};

router.get(
  "/danmaku.json",
  auth.routerSessionAuth,
  auth.routerActivityByOwner,
  function (req, res) {
    Danmaku.getAllDanmakuText(req.activity.id, (err, data) => {
      if (!err) res.send(data);
      else res.json([]);
    });
  }
);

router.get(
  "/danmaku.txt",
  auth.routerSessionAuth,
  auth.routerActivityByOwner,
  function (req, res) {
    Danmaku.getAllDanmaku(req.activity.id, (err, data) => {
      if (!err) {
        let result = "";
        for (const item of data) result += item.text + "\n";
        res.contentType("text/plain");
        res.send(result);
      } else {
        res.contentType("text/plain");
        res.send("");
      }
    });
  }
);

module.exports = { info, router };
