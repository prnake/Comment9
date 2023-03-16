import { getUuid4Hex } from "@/utils";
import * as constants from "@/components/ChatRenderer/constants";
import * as avatar from "./avatar";
import { io } from "socket.io-client";
import i18n from "@/i18n.js";

export default class ChatClientComment {
  constructor() {
    this.minSleepTime = 800;
    this.maxSleepTime = 1200;

    this.onAddText = null;
    this.onAddGift = null;
    this.onAddMember = null;
    this.onAddSuperChat = null;
    this.onDelSuperChat = null;
    this.onUpdateTranslation = null;
    this.activityId = null;
    this.tokenName = null;
    this.token = null;

    this.timerId = null;
  }

  start() {
    this.setSocket();
  }

  stop() {}

  setSocket() {
    this.socket = io("/danmaku", {
      path: window.location.pathname.replace(/\/$/, "") + "/socket.io",
      query: {
        activity: this.activityId,
        tokenName: this.tokenName,
        token: this.token,
      },
    });
    this.socket.on("connect", () => {
      this.onAddText({
        authorType: constants.AUTHRO_TYPE_ADMIN,
        privilegeType: 0,
        avatarUrl: avatar.ADMIN_AVATAR_URL,
        timestamp: new Date().getTime() / 1000,
        authorName: "Comment9",
        content: i18n.t("Server connected"),
        isGiftDanmaku: false,
        authorLevel: 10,
        isNewbie: true,
        isMobileVerified: true,
        medalLevel: 10,
        id: getUuid4Hex(),
        translation: "",
      });
      console.log("Server connected");
    });
    this.socket.on("disconnect", () => {
      this.onAddText({
        authorType: constants.AUTHRO_TYPE_ADMIN,
        privilegeType: 0,
        avatarUrl: avatar.ADMIN_AVATAR_URL,
        timestamp: new Date().getTime() / 1000,
        authorName: "Comment9",
        content: i18n.t("Server disconnect"),
        isGiftDanmaku: false,
        authorLevel: 10,
        isNewbie: true,
        isMobileVerified: true,
        medalLevel: 10,
        id: getUuid4Hex(),
        translation: "",
      });
      console.log("Server disconnect");
    });
    this.socket.on("danmaku", (data) => {
      if (data.addons && data.addons.star) {
        this.onAddSuperChat({
          id: getUuid4Hex(),
          avatarUrl: avatar.DEFAULT_AVATAR_URL,
          timestamp: new Date().getTime() / 1000,
          authorName: data.username,
          price: 100,
          content: data.text,
          translation: "",
        });
      } else {
        this.onAddText({
          authorType: constants.AUTHRO_TYPE_NORMAL,
          privilegeType: 0,
          avatarUrl: data.userimg ? data.userimg : avatar.DEFAULT_AVATAR_URL,
          timestamp: new Date().getTime() / 1000,
          authorName: data.username,
          content: data.text,
          isGiftDanmaku: false,
          authorLevel: 10,
          isNewbie: true,
          isMobileVerified: true,
          medalLevel: 10,
          id: data.id,
          translation: "",
        });
      }
    });
  }
}
