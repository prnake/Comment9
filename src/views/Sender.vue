<template>
  <div style="text-align: center">
    <remote-script
      :src="$rootPath + '/js/CommentCoreLibrary.min.js'"
    ></remote-script>
    <div id="damaku-player" class="damaku-player">
      <h1>{{ activityName }}</h1>
      <div id="damaku-container" class="damaku-container"></div>
    </div>
    <el-row type="flex" justify="center" align="middle">
      <el-col :xs="{ span: 24 }" :sm="{ span: 22 }" :md="{ span: 20 }">
        <el-input
          class="pad-right-60"
          type="text"
          :placeholder="$t('Send friendly danmaku to capture the moment')"
          v-model="danmaku.text"
          @keyup.enter.native="sendDanmaku()"
          :maxlength="wordLimit"
          :autofocus="true"
        >
          <el-popover
            placement="top-start"
            slot="prefix"
            class="sketch"
            :title="$t('Advanced Settings')"
            width="250"
            trigger="click"
          >
            <p class="height-5">{{ $t("Color") }}</p>
            <el-color-picker
              v-model="color"
              show-alpha
              :predefine="[
                '#ff4500',
                '#ff8c00',
                '#ffd700',
                '#90ee90',
                '#00ced1',
                '#1e90ff',
                '#c71585',
                '#000000',
              ]"
            >
            </el-color-picker>
            <div style="margin-top: 20px">
              <p class="height-5">{{ $t("Danmaku Mode") }}</p>
              <el-radio-group v-model="danmaku.mode" size="small">
                <el-radio-button :label="1">{{
                  $t("Top scrolling")
                }}</el-radio-button>
                <el-radio-button :label="2">{{
                  $t("Bottom scrolling")
                }}</el-radio-button>
              </el-radio-group>
              <el-radio-group v-model="danmaku.mode" size="small">
                <el-radio-button :label="4">{{ $t("Bottom") }}</el-radio-button>
                <el-radio-button :label="5">{{ $t("Top") }}</el-radio-button>
                <el-radio-button :label="6">{{
                  $t("Reverse")
                }}</el-radio-button>
              </el-radio-group>
            </div>
            <div style="margin-top: 20px">
              <p class="height-5">{{ $t("Font Size") }}</p>
              <el-radio-group v-model="danmaku.size" size="small">
                <el-radio-button :label="18">{{ $t("Small") }}</el-radio-button>
                <el-radio-button :label="25">{{
                  $t("Middle")
                }}</el-radio-button>
                <el-radio-button :label="36">{{ $t("Big") }}</el-radio-button>
              </el-radio-group>
            </div>
            <div style="margin-top: 20px">
              <p class="height-5">{{ $t("Choose Language") }}</p>
              <el-radio-group
                v-model="$i18n.locale"
                size="small"
                @change="change_language"
              >
                <el-radio-button label="zh_CN">简体中文</el-radio-button>
                <el-radio-button label="zh_TW">繁體中文</el-radio-button>
              </el-radio-group>
              <el-radio-group
                v-model="$i18n.locale"
                size="small"
                @change="change_language"
              >
                <el-radio-button label="en">English</el-radio-button>
                <el-radio-button label="ja">日本語</el-radio-button>
              </el-radio-group>
            </div>
            <div style="margin-top: 20px" v-if="username">
              <p class="height-5">
                {{ $t("Your nickname:") + " " + username }}
              </p>
              <el-button @click="setUsername('')">{{
                $t("Clear nickname")
              }}</el-button>
            </div>
            <el-button
              slot="reference"
              type="text"
              icon="el-icon-setting"
            ></el-button>
          </el-popover>
          <el-button
            slot="suffix"
            type="text"
            icon="el-icon-s-promotion"
            @click="sendDanmaku()"
            >{{ $t("Send") }}</el-button
          >
        </el-input>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import tinycolor from "tinycolor2";
import Cookies from "js-cookie";

export default {
  name: "Wall",
  data() {
    return {
      activityId: "",
      tokenName: "",
      token: "",
      wordLimit: 200,
      activityName: "弹幕墙",
      danmaku: {
        mode: 1,
        size: 25,
        dur: 4000,
        time: 0,
      },
      color: "rgba(0, 0, 0, 1)",
      username: "",
    };
  },
  mounted() {
    this.username = Cookies.get("username");
    this.activityId = this.$route.params.id;
    this.tokenName = this.$route.params.name;
    this.token = this.$route.params.token ? this.$route.params.token : "";
    this.getActivityConfig();
    window.addEventListener("load", () => {
      this.setDanmaku();
      this.setSocket();
      //this.danmakuTest();
    });
  },
  methods: {
    setUsername(username) {
      this.username = username;
      Cookies.set("username", username);
    },
    sendDanmaku: async function () {
      if (!this.username) {
        this.$prompt(this.$t("Please set your nickname"), this.$t("Notice"), {
          confirmButtonText: this.$t("Yes"),
          cancelButtonText: this.$t("No"),
        })
          .then(({ value }) => {
            if (value) {
              this.setUsername(value);
              this.$message({
                type: "success",
                message: this.$t("Success"),
              });
            } else {
              this.$message({
                type: "info",
                message: this.$t("Input field can not be empty"),
              });
            }
          })
          .catch(() => {});
        return;
      }
      const color = tinycolor(this.color);
      if (!this.danmaku.text) return;
      const danmaku = {
        ...this.danmaku,
        username: Cookies.get("username"),
        color: parseInt(color.toHexString().slice(1), 16),
        addons: {
          opacity: color.getAlpha(),
        },
      };
      this.socket.emit("push", danmaku);
      this.danmaku.text = "";
    },
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
      this.socket = io(this.$rootPath + "/danmaku", {
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
      });
      this.socket.on("push", (data) => {
        this.$message({
          type: "success",
          message: this.$t(data),
        });
      });
      this.socket.on("message", (data) => {
        this.$message({
          type: "error",
          message: this.$t(data),
        });
      });
      console.log(this.socket);
    },
    getActivityConfig: async function () {
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
        this.wordLimit = result.data.wordLimit || 200;
      }
    },
    change_language(language) {
      Cookies.set("language", language);
    },
    danmakuTest: function () {
      const cmt = [
        {
          mode: 1,
          text: "1上上上上上端",
          stime: 0,
          size: 25,
          color: 0x0000ff,
          border: true,
          shadow: false,
        },
        {
          mode: 2,
          text: "2下下下下下端",
          stime: 0,
          size: 25,
          color: 0x00ff00,
          border: false,
          shadow: false,
        },
        {
          mode: 4,
          text: "4底底底底底部",
          stime: 0,
          size: 30,
          color: 0x000000,
          border: false,
          shadow: false,
        },
        {
          mode: 5,
          text: "5顶顶顶顶顶部",
          stime: 0,
          size: 25,
          color: 0xff0000,
          border: false,
          shadow: false,
        },
        {
          mode: 6,
          text: "6逆逆逆逆逆向",
          stime: 0,
          size: 30,
          color: 0x000000,
          border: false,
          shadow: false,
        },
        {
          mode: 7,
          text: "7定定定定定位",
          stime: 0,
          size: 25,
          color: 0x0ffff0,
          x: 180,
          y: 180,
          rY: 20,
          rZ: 20,
          border: false,
          shadow: false,
        },
      ];
      this.cm.send(cmt);
      setTimeout(() => {
        this.cm.send(cmt);
      }, 2000);
    },
  },
};
</script>

<style lang="scss">
body {
  margin: 0;
}
.damaku-player {
  height: 90vh;
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
  z-index: 2000;
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

/deep/.el-input--suffi.pad-right-60 .el-input__inner {
  padding-right: 60px;
}

.height-5 {
  height: 5px;
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
