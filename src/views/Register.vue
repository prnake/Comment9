<template>
  <div style="text-align: center">
    <el-form
      ref="registerForm"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="register-box"
    >
      <h1 class="register-title">Comment9</h1>
      <h3 class="register-subtitile">{{ $t("management") }}</h3>
      <el-form-item :label="$t('username')" prop="username">
        <el-input type="text" v-model="form.username" />
      </el-form-item>
      <el-form-item :label="$t('password')" prop="password">
        <el-input type="password" v-model="form.password" />
      </el-form-item>
      <el-form-item :label="$t('invite code')" prop="invite_code">
        <el-input type="text" v-model="form.invite_code" />
      </el-form-item>
      <el-button style="width: 120px" v-on:click="$router.push({ name: 'Login' })">{{ $t("login") }}</el-button>
      <el-button style="width: 120px" type="primary" v-on:click="register()">{{
        $t("register")
      }}</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "Register",
  data() {
    return {
      form: {
        username: "",
        password: "",
        invite_code: ""
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
    register() {
      this.$refs["registerForm"].validate(async (valid) => {
        if (valid) {
          const result = await this.axios
            .post(this.$rootPath + "/user/register", {
              user: this.form.username,
              password: this.form.password,
              invite_code: this.form.invite_code
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
.register-box {
  border: 1px solid #dcdfe6;
  width: 500px;
  margin: 180px auto;
  padding: 35px 35px 15px 35px;
  border-radius: 5px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  box-shadow: 0 0 25px #909399;
}

.register-title {
  text-align: center;
  height: 0.7em;
  color: #303133;
}
.register-subtitle {
  text-align: center;
  margin: 0 auto 10px auto;
  color: #303133;
}
</style>
