<template>
  <div style="text-align: center">
    <remote-script
      :src="$rootPath + '/js/CommentCoreLibrary.min.js'"
    ></remote-script>
    <div id="damaku-player" class="damaku-player" style="height: 100vh">
      <h1>{{ activityName }}</h1>
      <div id="damaku-container" class="damaku-container"></div>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";

export default {
  name: "Wall",
  data() {
    return {
      activityId: "",
      tokenName: "",
      token: "",
      activityName: "弹幕墙",
    };
  },
  mounted() {
    this.activityId = this.$route.params.id;
    this.tokenName = this.$route.params.name;
    this.token = this.$route.params.token ? this.$route.params.token : "";
    if (this.activityId) this.getActivityName();
    window.addEventListener("load", () => {
      this.setDanmaku();
      if (this.activityId) this.setSocket();
      else this.danmakuTest();
    });
  },
  methods: {
    setDanmaku: function () {
      this.cm = new window.CommentManager(
        document.getElementById("damaku-container")
      );
      this.cm.options.scroll.scale = Math.round(
        document.body.clientWidth / 500
      );
      this.cm.init();
      this.cm.start();
      window.addEventListener("resize", () => {
        this.cm.setBounds();
      });
    },
    setSocket: function () {
      this.socket = io("/danmaku", {
        path: this.$rootPath + "/socket.io",
        query: {
          activity: this.activityId,
          tokenName: this.tokenName,
          token: this.token,
        },
      });
      this.socket.on("connect", () => {
        this.cm.send({
          mode: 5,
          text: this.$t("Server connected"),
          stime: 0,
          size: 25,
          color: 0x000000,
          border: true,
          shadow: false,
        });
        console.log("Server connected");
      });
      this.socket.on("disconnect", () => {
        this.cm.send({
          mode: 5,
          text: this.$t("Server disconnect"),
          stime: 0,
          size: 25,
          color: 0x000000,
          border: true,
          shadow: false,
        });
        console.log("Server disconnect");
      });
      this.socket.on("danmaku", (data) => {
        const danmaku = {
          shadow: data.color == 0xffffff ? true : false,
          ...data.addons,
          mode: data.mode,
          text: data.text,
          dur: data.dur,
          size: data.size,
          color: data.color,
          stime: data.time,
        };
        this.cm.send(danmaku);
        //    const color = parseInt(data.color) || 0;
        //    const postion = parseInt(data.mode) || 1;
        //    context.show(data.text, color, postion);
      });
      console.log(this.socket);
    },
    getActivityName: async function () {
      const result = await this.axios
        .get(this.$rootPath + "/danmaku/config", {
          params: {
            activity: this.activityId,
            name: this.tokenName,
            token: this.token,
          },
        })
        .then((data) => data.data);
      if (result.success) {
        this.activityName = result.data.name;
      }
    },
    danmakuTest: function () {
      const getColor = () => {
        return [
          0x000000, 0xff4500, 0xff8c00, 0xffd700, 0x90ee90, 0x00ced1, 0x1e90ff,
          0xc71585,
        ][Math.floor(Math.random() * 8)];
      };
      const cmt = [
        {
          mode: 1,
          text: "1上上上上上端",
          stime: 0,
          size: 25,
          color: getColor(),
          border: true,
          shadow: false,
        },
        {
          mode: 2,
          text: "2下下下下下端",
          stime: 0,
          size: 25,
          color: getColor(),
          border: false,
          shadow: false,
        },
        {
          mode: 4,
          text: "4底底底底底部",
          stime: 0,
          size: 30,
          color: getColor(),
          border: false,
          shadow: false,
        },
        {
          mode: 5,
          text: "5顶顶顶顶顶部",
          stime: 0,
          size: 25,
          color: getColor(),
          border: false,
          shadow: false,
        },
        {
          mode: 6,
          text: "6逆逆逆逆逆向",
          stime: 0,
          size: 30,
          color: getColor(),
          border: false,
          shadow: false,
        },
        {
          mode: 7,
          text: "7定定定定定位",
          stime: 0,
          size: 25,
          color: getColor(),
          x: Math.floor(Math.random() * 200),
          y: Math.floor(Math.random() * 200),
          rY: Math.floor(Math.random() * 20),
          rZ: Math.floor(Math.random() * 20),
          border: false,
          shadow: false,
        },
      ];
      this.cm.send(cmt[Math.floor(Math.random() * 6)]);
      setTimeout(this.danmakuTest, 100);
    },
  },
};
</script>

<style lang="scss">
body {
  margin: 0;
}
.damaku-player {
  height: 100vh;
}
.damaku-player {
  position: relative;
}
.damaku-player h1 {
  color: rgba(0, 0, 0, 0.24);
  position: absolute;
  width: 100%;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 60px;
}
.damaku-player .damaku-container {
  border: 0;
  bottom: 0;
  display: block;
  left: 0;
  margin: 0;
  overflow: hidden;
  position: absolute;
  right: 0;
  top: 0;
  -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  z-index: 9999;
}

.damaku-player .damaku-container .cmt {
  color: #fff;
  font-family: SimHei, SimSun, Heiti, "MS Mincho", "Meiryo", "Microsoft YaHei",
    monospace;
  font-size: 25px;
  letter-spacing: 0;
  line-height: 100%;
  margin: 0;
  padding: 3px 0 0 0;
  position: absolute;
  text-decoration: none;
  text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
  -webkit-text-size-adjust: none;
  -ms-text-size-adjust: none;
  text-size-adjust: none;
  -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  -webkit-transform-origin: 0% 0%;
  -ms-transform-origin: 0% 0%;
  transform-origin: 0% 0%;
  white-space: pre;
  word-break: keep-all;
}

.damaku-player .damaku-container .cmt.no-shadow {
  text-shadow: none;
}

.damaku-player .damaku-container .cmt.reverse-shadow {
  text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
}

.damaku-player .damaku-container .cmt.css-optimize {
  will-change: transform;
}

/** Aliases for Chinese named fonts because they don't work on *nix **/
@font-face {
  font-family: "\9ED1\4F53";
  src: local("SimHei");
}

@font-face {
  font-family: "\5B8B\4F53";
  src: local("SimSun");
}

@font-face {
  font-family: "\534E\6587\6977\4F53";
  src: local("SimKai");
}

@font-face {
  font-family: "\5E7C\5706";
  src: local("YouYuan");
}

@font-face {
  font-family: "\5FAE\8F6F\96C5\9ED1";
  src: local("Microsoft YaHei");
}
</style>
