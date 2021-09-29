const tool = require("../../utils/tool");

const info = function () {
  let data = { panel: {} };

  tool.setPanelTitle(data.panel, "Development", "Docs for developer.");
  tool.addPanelItem(
    data.panel,
    "Docs",
    [],
    "",
    "https://github.com/prnake/Comment9/blob/master/README.md",
    "open"
  );
  tool.addPanelItem(
    data.panel,
    "Backend Docs",
    [],
    "",
    "https://github.com/prnake/Comment9/blob/master/docs/develop.md",
    "open"
  );

  return data;
};

module.exports = { info };
