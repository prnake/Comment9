<template>
  <div class="dplayer"></div>
</template>

<script>
import Hls from "hls.js";
import DPlayer from "dplayer";
export default {
  props: {
    autoplay: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      default: "#FADFA3",
    },
    loop: {
      type: Boolean,
      default: false,
    },
    lang: {
      type: String,
      default: "zh",
    },
    screenshot: {
      type: Boolean,
      default: false,
    },
    hotkey: {
      type: Boolean,
      default: true,
    },
    preload: {
      type: String,
      default: "auto",
    },
    contextmenu: {
      type: Array,
    },
    logo: {
      type: String,
    },
    video: {
      type: Object,
    },
  },
  data() {
    return {
      dp: null,
    };
  },
  methods: {
    init() {
      const player = (this.dp = new DPlayer({
        element: this.$el,
        autoplay: this.autoplay,
        theme: this.theme,
        loop: this.loop,
        lang: this.lang,
        screenshot: this.screenshot,
        hotkey: this.hotkey,
        preload: this.preload,
        contextmenu: this.contextmenu,
        logo: this.logo,
        video: {
          url: this.video.url,
          pic: this.video.pic,
          thumbnails: this.video.thumbnails,
          type: this.video.type,
          customType: {
            customHls: function (video) {
              const hls = new Hls();
              hls.loadSource(video.src);
              hls.attachMedia(video);
            },
          },
        },
      }));
      player.on("play", () => {
        this.$emit("play");
      });
      player.on("quality_start", () => {
        this.$emit("quality_start");
        player.on("play");
      });
      player.on("pause", () => {
        this.$emit("pause");
      });
      player.on("canplay", () => {
        this.$emit("canplay");
      });
      player.on("playing", () => {
        this.$emit("playing");
      });
      player.on("ended", () => {
        this.$emit("ended");
      });
      player.on("error", () => {
        this.$emit("error");
      });
    },
  },
  mounted() {},
};
</script>
<style scoped></style>
