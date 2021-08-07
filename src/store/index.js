import Vue from "vue";
import Vuex from "vuex";
import router from "../router";
import axios from "axios";

const config = require("../../config");

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isLogin: false,
  },
  mutations: {
    changeLogin(state, status) {
      state.isLogin = status;
    },
  },
  actions: {
    async checkLogin({ commit }) {
      const result = await axios
        .get(config.rootPath + "/user/status", { validateStatus: false })
        .then((data) => data.data.success);
      if (!result) {
        router.push({ name: "Login" });
        return;
      }
      commit("changeLogin", result);
    },
  },
  modules: {},
});
