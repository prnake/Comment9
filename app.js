const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const history = require("connect-history-api-fallback");
const RedisStore = require("connect-redis")(session);

const config = require("./config");
const redis = require("./utils/redis");

const user = require("./routes/user");
const activity = require("./routes/activity");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  path: `${config.rootPath}/socket.io`,
  cors: {
    origin: "*",
  },
});

app.set("socketio", io);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  session({
    secret: config.session.cookieSecrect,
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({ client: redis }),
  })
);

app.use(config.rootPath + "/user", user);
app.use(config.rootPath + "/activity", activity);
for (const name of config.danmaku.senders) {
  const sender = require("./routes/sender/" + name);
  if (sender.router) app.use(config.rootPath + "/" + name, sender.router);
  if (sender.socket) sender.socket(io, "/" + name);
}

app.use(
  config.rootPath + "/livechat/",
  express.static(path.join(__dirname, "livechat", "dist"))
);
app.use(config.rootPath, express.static(path.join(__dirname, "dist")));
app.use(history());
app.use(config.rootPath, express.static(path.join(__dirname, "public")));

// catch 404 and forward to error handler
app.use(function (req, res) {
  // set locals, only providing error in development
  res.locals.message = "404: Not Found";
  res.locals.error = "";
  res.status(404);
  res.render("error");
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = { app, server };
