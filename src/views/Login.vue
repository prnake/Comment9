<template>
  <div>
    <el-form
      ref="loginForm"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="login-box"
    >
      <h1 class="login-title">Comment9</h1>
      <h3 class="login-subtitile">{{ $t("management") }}</h3>
      <el-form-item :label="$t('username')" prop="username">
        <el-input type="text" v-model="form.username" />
      </el-form-item>
      <el-form-item :label="$t('password')" prop="password">
        <el-input type="password" v-model="form.password" />
      </el-form-item>
      <el-button style="width: 200px" type="primary" v-on:click="login()">{{
        $t("login")
      }}</el-button>
      <!-- <el-button v-on:click="$router.push('/register')">{{ $t("register") }}</el-button> -->
    </el-form>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      form: {
        username: "",
        password: "",
      },
      rules: {
        username: [
          {
            required: true,
            message: this.$t("please input username"),
            trigger: "blur",
          },
        ],
        password: [
          {
            required: true,
            message: this.$t("please input password"),
            trigger: "blur",
          },
        ],
      },
    };
  },
  async mounted() {
    const result = await this.axios
      .get(this.$rootPath + "/user/status")
      .then((data) => data.data);
    if (result.success) {
      this.$router.push({ name: "Manage" });
    }
  },
  methods: {
    login() {
      this.$refs["loginForm"].validate(async (valid) => {
        if (valid) {
          const result = await this.axios
            .post(this.$rootPath + "/user/login", {
              user: this.form.username,
              password: this.form.password,
            })
            .then((data) => data.data.success);
          if (result) {
            this.$router.push({ name: "Manage" });
          }
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.login-box {
  border: 1px solid #dcdfe6;
  width: 500px;
  margin: 180px auto;
  padding: 35px 35px 15px 35px;
  border-radius: 5px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  box-shadow: 0 0 25px #909399;
}

.login-title {
  text-align: center;
  height: 0.7em;
  color: #303133;
}
.login-subtitle {
  text-align: center;
  margin: 0 auto 10px auto;
  color: #303133;
}
</style>
