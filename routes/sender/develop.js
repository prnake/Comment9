const tool = require("../../utils/tool");

const info = function () {
  let data = { panel: {} };

  tool.setPanelTitle(data.panel, "Development", "Docs for developer.");
  tool.addPanelItem(
    data.panel,
    "API Docs",
    [],
    "",
    "https://github.com",
    "open"
  );
  tool.addPanelItem(
    data.panel,
    "Backend Docs",
    [],
    "",
    "https://github.com",
    "open"
  );

  return data;
};

module.exports = { info };
