<template>
  <div class="home">
    <el-container>
      <el-header>
        <el-row type="flex" justify="center" align="middle">
          <el-col :xs="{ span: 24 }" :sm="{ span: 22 }" :md="{ span: 20 }">
            <el-menu
              :default-active="activeIndex"
              class="menu"
              mode="horizontal"
              text-color="#34495e"
              active-text-color="#1abc9c"
              @select="handleSelect"
            >
              <el-menu-item index="/">
                <div class="logo">Comment9</div>
              </el-menu-item>
              <el-menu-item index="name">{{ activityName }}</el-menu-item>
              <el-submenu index="activity">
                <template slot="title">{{ $t("ACTIVITY") }}</template>
                <div
                  v-for="(activity, index) in activities"
                  v-bind:key="activity.id"
                >
                  <el-menu-item :index="index">{{
                    activity.name
                  }}</el-menu-item>
                </div>
                <el-menu-item index="creat">{{ $t("CREAT") }}</el-menu-item>
              </el-submenu>

              <el-menu-item
                index="logout"
                class="docker-right"
                @click="logout()"
                >{{ $t("Log Out") }}</el-menu-item
              >

              <el-submenu style="float: right">
                <template slot="title">Language</template>
                <el-menu-item index="zh_CN" @click="change_language('zh_CN')"
                  >简体中文</el-menu-item
                >
                <el-menu-item index="zh_TW" @click="change_language('zh_TW')"
                  >繁體中文</el-menu-item
                >
                <el-menu-item index="en" @click="change_language('en')"
                  >English</el-menu-item
                >
                <el-menu-item index="ja" @click="change_language('ja')"
                  >日本語</el-menu-item
                >
              </el-submenu>
            </el-menu>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <el-row type="flex" justify="center" align="middle">
          <el-col :xs="{ span: 24 }" :sm="{ span: 22 }" :md="{ span: 20 }">
            <div class="container" v-if="!hasActivity">
              <div>
                <h1>{{ $t("Welcome to Comment9") }}</h1>
                <p>{{ $t("To start, creat an actvity first.") }}</p>
              </div>
            </div>
            <div v-else>
              <div class="container">
                <h1>{{ $t("Activity Setting") }}</h1>
                <el-input
                  class="font-16"
                  :placeholder="$t('Activity Name')"
                  v-model="activityEditInfo.name"
                >
                  <template slot="prepend">{{ $t("Activity Name") }}</template>
                </el-input>
                <el-checkbox class="col-20" v-model="activityEditInfo.audit">{{
                  $t("Enable manual audit")
                }}</el-checkbox>
                <p class="height-5">{{ $t("Sender List") }}</p>
                <el-checkbox-group v-model="activityEditInfo.senders">
                  <div
                    v-for="sender in activityEditInfo.senderList"
                    v-bind:key="sender"
                  >
                    <el-checkbox :label="sender">{{
                      $t("sender:" + sender)
                    }}</el-checkbox>
                  </div>
                </el-checkbox-group>
                <p class="height-5">{{ $t("Filter List") }}</p>
                <el-checkbox-group v-model="activityEditInfo.filters">
                  <div
                    v-for="filter in activityEditInfo.filterList"
                    v-bind:key="filter"
                  >
                    <el-checkbox :label="filter">{{
                      $t("filter:" + filter)
                    }}</el-checkbox>
                  </div>
                </el-checkbox-group>

                <el-button
                  class="col-20"
                  type="primary"
                  @click="saveBasicInfo()"
                  >{{ $t("Save") }}<i class="el-icon-upload el-icon--right"></i
                ></el-button>
                <el-button
                  class="col-20 docker-right"
                  type="danger"
                  @click="deleteActivity()"
                  >{{ $t("Delete")
                  }}<i class="el-icon-delete el-icon--right"></i
                ></el-button>
              </div>
              <div class="container">
                <h1>{{ $t("Token Setting") }}</h1>
                <el-table
                  :data="activityTokens"
                  style="width: 100%"
                  :row-style="{ height: '0' }"
                  :cell-style="{ padding: '0' }"
                >
                  <el-table-column :label="$t('Name')">
                    <template slot-scope="scope">
                      <p>{{ scope.row.name }}</p>
                    </template>
                  </el-table-column>

                  <el-table-column :label="$t('Token')">
                    <template slot-scope="scope">
                      <p>{{ scope.row.token }}</p>
                    </template>
                  </el-table-column>

                  <el-table-column :label="$t('Perms')">
                    <template slot-scope="scope">
                      <el-popover
                        v-for="perm in scope.row.perms"
                        v-bind:key="perm"
                        trigger="hover"
                        placement="top"
                        width="200"
                      >
                        <p>{{ $t(permDescription[perm]) }}</p>
                        <el-tag size="medium" slot="reference">{{
                          perm
                        }}</el-tag>
                      </el-popover>
                    </template>
                  </el-table-column>

                  <el-table-column :label="$t('Method')">
                    <template slot-scope="scope">
                      <el-button
                        size="mini"
                        @click="
                          tokenForm = scope.row;
                          tokenFormVisible = true;
                        "
                      >
                        {{ $t("Edit") }}</el-button
                      >
                      <el-button
                        size="mini"
                        type="danger"
                        v-if="!scope.row.perms.includes('protect')"
                        @click="removeToken(scope.row)"
                        >{{ $t("Remove") }}</el-button
                      >
                    </template>
                  </el-table-column>
                </el-table>

                <el-button
                  class="col-20"
                  type="primary"
                  @click="
                    tokenForm = { name: '', token: '', perms: [] };
                    activityTokens.push(tokenForm);
                    tokenFormVisible = true;
                  "
                  >{{ $t("Add") }}<i class="el-icon-plus el-icon--right"></i
                ></el-button>

                <el-dialog
                  :title="$t('Edit Token')"
                  :visible.sync="tokenFormVisible"
                  width="30%"
                >
                  <el-input
                    class="font-16"
                    v-if="!tokenForm.perms.includes('protect')"
                    :placeholder="$t('Name')"
                    v-model="tokenForm.name"
                  >
                    <template slot="prepend">{{ $t("Name") }}</template>
                  </el-input>
                  <el-input
                    class="font-16"
                    :placeholder="$t('Token')"
                    v-model="tokenForm.token"
                  >
                    <template slot="prepend">{{ $t("Token") }}</template>
                  </el-input>
                  <p class="font-16 height-5">{{ $t("Perms") }}</p>
                  <el-checkbox-group v-model="tokenForm.perms">
                    <div
                      v-for="perm in tokenForm.perms.includes('protect')
                        ? activityEditInfo.permList.filter(
                            (perm) => perm.name === 'protect'
                          )
                        : activityEditInfo.permList"
                      v-bind:key="perm.name"
                    >
                      <el-checkbox :label="perm.name"
                        >{{ perm.name + ": " + $t(permDescription[perm.name]) }}
                      </el-checkbox>
                    </div>
                  </el-checkbox-group>
                  <span slot="footer" class="dialog-footer">
                    <el-button @click="tokenFormVisible = false">{{
                      $t("Cancel")
                    }}</el-button>
                    <el-button
                      type="primary"
                      @click="
                        editToken(tokenForm);
                        tokenFormVisible = false;
                      "
                      >{{ $t("Save") }}</el-button
                    >
                  </span>
                </el-dialog>
              </div>
              <div class="container">
                <h1>{{ $t("Addon Setting") }}</h1>
                <el-table
                  :data="activityEditInfo.addonList"
                  style="width: 100%"
                  :row-style="{ height: '0' }"
                  :cell-style="{ padding: '0' }"
                >
                  <el-table-column :label="$t('Name')">
                    <template slot-scope="scope">
                      <p>{{ scope.row.name }}</p>
                    </template>
                  </el-table-column>

                  <el-table-column :label="$t('Description')">
                    <template slot-scope="scope">
                      <p>{{ $t(scope.row.description) }}</p>
                    </template>
                  </el-table-column>

                  <el-table-column :label="$t('Value')">
                    <template slot-scope="scope">
                      <p>{{ activityEditInfo.addons[scope.row.name] }}</p>
                    </template>
                  </el-table-column>

                  <el-table-column :label="$t('Method')">
                    <template slot-scope="scope">
                      <el-button
                        size="mini"
                        @click="
                          addonForm = {
                            name: scope.row.name,
                            type: scope.row.type,
                            value: activityEditInfo.addons[scope.row.name],
                          };
                          if (!addonForm.value)
                            addonForm.value = scope.row.default;
                          if (addonForm.type == 'List')
                            addonForm.value = addonForm.value.join('\n');
                          addonFormVisible = true;
                        "
                      >
                        {{ $t("Edit") }}</el-button
                      >
                      <el-button size="mini" @click="removeAddon(scope.row)">{{
                        $t("Clear")
                      }}</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-dialog
                  :title="addonForm.name"
                  :visible.sync="addonFormVisible"
                  width="30%"
                >
                  <el-input
                    class="font-16"
                    :placeholder="$t('Number')"
                    v-model="addonForm.value"
                    v-if="addonForm.type == 'Number'"
                  >
                    <template slot="prepend">{{ $t("Number") }}</template>
                  </el-input>
                  <el-input
                    class="font-16"
                    :placeholder="$t('String')"
                    v-model="addonForm.value"
                    v-if="addonForm.type == 'String'"
                  >
                    <template slot="prepend">{{ $t("String") }}</template>
                  </el-input>
                  <el-switch
                    v-model="addonForm.value"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    v-if="addonForm.type == 'Boolean'"
                  >
                  </el-switch>
                  <el-input
                    type="textarea"
                    :autosize="{ minRows: 2, maxRows: 10 }"
                    :placeholder="$t('Please input value split by line.')"
                    v-model="addonForm.value"
                    v-if="addonForm.type == 'List'"
                  >
                  </el-input>
                  <p class="height-5" v-if="addonForm.type == 'List'">
                    {{ $t("Please input value split by line.") }}
                  </p>

                  <span slot="footer" class="dialog-footer">
                    <el-button @click="addonFormVisible = false">{{
                      $t("Cancel")
                    }}</el-button>
                    <el-button
                      type="primary"
                      @click="
                        editAddon(addonForm);
                        addonFormVisible = false;
                      "
                      >{{ $t("Save") }}</el-button
                    >
                  </span>
                </el-dialog>
              </div>

              <div
                class="container"
                v-for="panel in activityEditInfo.panelList"
                v-bind:key="panel"
              >
                <h1 class="height-5">{{ $t(panel.title) }}</h1>
                <p class="font-20">
                  {{ $t(panel.description) }}
                </p>
                <div v-for="item in panel.items" v-bind:key="item">
                  <p class="height-5">
                    {{ $t(item.name) }}
                    <el-popover
                      v-for="perm in item.perms"
                      v-bind:key="perm"
                      trigger="hover"
                      placement="top"
                      width="200"
                    >
                      <p>{{ $t(permDescription[perm]) }}</p>
                      <el-tag size="medium" slot="reference">{{ perm }}</el-tag>
                    </el-popover>
                  </p>

                  <p class="font-18 margin-0">{{ $t(item.description) }}</p>

                  <el-input
                    class="font-16 pad-right-60"
                    v-if="item.type === 'copy'"
                    :value="item.url"
                    :disabled="true"
                  >
                    <el-button
                      slot="suffix"
                      type="text"
                      icon="el-icon-document-copy"
                      @click="
                        $copyText(item.url);
                        $message({
                          type: 'success',
                          message: $t('Copied'),
                        });
                      "
                      >{{ $t("Copy") }}</el-button
                    >
                  </el-input>

                  <el-input
                    class="font-16 pad-right-130"
                    v-if="item.type === 'open'"
                    :value="item.url"
                    :disabled="true"
                  >
                    <a slot="suffix" target="_blank" :href="item.url"
                      ><el-button type="text" icon="el-icon-share">{{
                        $t("Open in new tab")
                      }}</el-button></a
                    >
                  </el-input>

                  <el-input
                    class="font-16 pad-right-130"
                    v-if="item.type === 'download'"
                    :value="item.url"
                    :disabled="true"
                  >
                    <a
                      slot="suffix"
                      target="_blank"
                      :href="item.url"
                      :download="item.description"
                      ><el-button type="text" icon="el-icon-download">{{
                        $t("Download")
                      }}</el-button></a
                    >
                  </el-input>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-main>
      <el-footer style="text-align: center"
        >Copyright (c) 2014-2021 SAST</el-footer
      >
    </el-container>
  </div>
</template>

<script>
import config from "../../config";
import Cookies from "js-cookie";
export default {
  data() {
    return {
      activeIndex: "name",
      activityName: "",
      activityId: "",
      activities: [],
      activityInfo: {},
      activityEditInfo: {},
      activityTokens: [],
      permDescription: {},
      tokenForm: { perms: [] },
      tokenFormVisible: false,
      addonForm: {},
      addonFormVisible: false,
    };
  },
  computed: {
    hasActivity: function () {
      return this.activities.length > 0;
    },
    danmaQUrl: function () {
      let result = [];
      const perms = ["pull"];
      const cal = function (id, name, token) {
        const info = {
          host: config.host + config.rootPath + "/danmaku",
          query: { activity: id, tokenName: name, token: token },
        };
        const url =
          "danmaQ://" + Buffer.from(JSON.stringify(info)).toString("base64");
        return url;
      };
      for (const token of this.activityTokens) {
        if (
          token.perms.every((perm) => perms.includes(perm)) &&
          perms.every((perm) => token.perms.includes(perm))
        )
          result.push({
            name: token.name,
            url: cal(this.activityId, token.name, token.token),
          });
      }
      return result;
    },
    danmakuWallUrl: function () {
      let result = [];
      const perms = ["pull"];
      const cal = function (id, name, token) {
        const url = `${config.host}${config.rootPath}/#/wall/${id}/${name}/${token}`;
        return url;
      };
      for (const token of this.activityTokens) {
        if (
          token.perms.every((perm) => perms.includes(perm)) &&
          perms.every((perm) => token.perms.includes(perm))
        )
          result.push({
            name: token.name,
            url: cal(this.activityId, token.name, token.token),
          });
      }
      return result;
    },
    danmakuWebSenderUrl: function () {
      let result = [];
      const perms = ["pull", "push"];
      const cal = function (id, name, token) {
        const url = `${config.host}${config.rootPath}/#/sender/${id}/${name}/${token}`;
        return url;
      };
      for (const token of this.activityTokens) {
        if (
          token.perms.every((perm) => perms.includes(perm)) &&
          perms.every((perm) => token.perms.includes(perm))
        )
          result.push({
            name: token.name,
            url: cal(this.activityId, token.name, token.token),
          });
      }
      return result;
    },
    danmakuAuditUrl: function () {
      let result = [];
      const perms = ["pull", "push", "audit"];
      const cal = function (id, name, token) {
        const url = `${config.host}${config.rootPath}/#/audit/${id}/${name}/${token}`;
        return url;
      };
      for (const token of this.activityTokens) {
        if (
          token.perms.every((perm) => perms.includes(perm)) &&
          perms.every((perm) => token.perms.includes(perm))
        )
          result.push({
            name: token.name,
            url: cal(this.activityId, token.name, token.token),
          });
      }
      return result;
    },
  },
  created: async function () {
    await this.getActivityList();
    if (this.$route.params.id == "creat" || !this.hasActivity) {
      this.activityName = this.$t("CREAT");
      this.creatPanel();
    } else if (this.$route.params.id) {
      this.getActivityInfo(this.$route.params.id);
    } else {
      const cookie_id = Cookies.get("activity");
      let activity_id = this.activities[0].id;
      for(const activity of this.activities){
        if(cookie_id === activity.id) 
          activity_id = cookie_id;
      }
      this.getActivityInfo(activity_id);
    }
    // console.log(result.data);
    //     if (this.activities.length>0) {
    //         this.handleSelect("0");
    //     } else {
    //         this.handleSelect("add");
    //     }

    // this.activityName = "活动"
  },
  methods: {
    async logout() {
      await this.axios
        .get(this.$rootPath + "/user/logout")
        .then((data) => data.data);
      this.$router.push({ name: "Home" });
    },
    async editAddon(row) {
      let value = row.value;
      if (row.type == "List") value = value.split("\n");
      switch (row.type) {
        case "List":
          if (!(value instanceof Array)) {
            this.$message({
              type: "error",
              message: this.$t("input error"),
            });
            return;
          }
          break;
        case "Boolean":
          value = !!value;
          break;
        case "String":
          break;
        case "Number":
          value = parseInt(value);
          if (isNaN(value)) {
            this.$message({
              type: "error",
              message: this.$t("input error"),
            });
            return;
          }
          break;
        default:
          break;
      }
      const result = await this.axios
        .post(this.$rootPath + "/activity/set", {
          activity: this.activityId,
          method: "setAddon",
          name: row.name,
          value: value,
        })
        .then((data) => data.data);
      this.handleResult(result);
    },
    async removeAddon(row) {
      const result = await this.axios
        .post(this.$rootPath + "/activity/set", {
          activity: this.activityId,
          method: "delAddon",
          name: row.name,
        })
        .then((data) => data.data);
      this.handleResult(result);
    },
    async editToken(row) {
      const result = await this.axios
        .post(this.$rootPath + "/activity/set", {
          activity: this.activityId,
          method: "setToken",
          name: row.name,
          token: row.token,
          perms: row.perms,
        })
        .then((data) => data.data);
      this.handleResult(result);
    },
    async removeToken(row) {
      const result = await this.axios
        .post(this.$rootPath + "/activity/set", {
          activity: this.activityId,
          method: "delToken",
          name: row.name,
        })
        .then((data) => data.data);
      this.handleResult(result);
    },
    handleSelect(key) {
      if (key == "creat") {
        this.creatPanel();
      } else if (key == "name") {
        if (this.activityName == this.$t("CREAT")) this.creatPanel();
      } else {
        this.getActivityInfo(this.activities[key].id);
      }
    },
    handleResult(result) {
      if (result.success) {
        this.$message({
          type: "success",
          message: this.$t("Saved"),
        });
        this.getActivityList();
        this.getActivityInfo(this.activityId);
      } else {
        this.$message({
          type: "error",
          message: this.$t(result.reason),
        });
      }
    },
    change_language(language) {
      this.$i18n.locale = language;
      Cookies.set("language", language);
    },
    async saveBasicInfo() {
      let result = { success: true };
      if (
        this.activityEditInfo.name &&
        this.activityEditInfo.name != this.activityInfo.name
      ) {
        result = await this.axios
          .post(this.$rootPath + "/activity/set", {
            activity: this.activityId,
            method: "updateName",
            name: this.activityEditInfo.name,
          })
          .then((data) => data.data);
      }
      if (result.success) {
        result = await this.axios
          .post(this.$rootPath + "/activity/set", {
            activity: this.activityId,
            method: "updateInfo",
            audit: this.activityEditInfo.audit,
            senders: this.activityEditInfo.senders,
            filters: this.activityEditInfo.filters,
          })
          .then((data) => data.data);
        this.handleResult(result);
      } else {
        this.$message({
          type: "error",
          message: this.$t(result.reason),
        });
      }
    },
    async getActivityList() {
      const result = await this.axios.get(this.$rootPath + "/activity/list", {
        validateStatus: false,
      });
      //   result.status = 200;
      //   result.data = {
      //     success: true,
      //     activities: [
      //       {
      //         _id: "61014c583ff837f67bdfa5b6",
      //         name: "学生节",
      //         id: "61014c583ff837f67bdfa5b6",
      //       },
      //       {
      //         _id: "61014c613ff837f67bdfa5c0",
      //         name: "测试",
      //         id: "61014c613ff837f67bdfa5c0",
      //       },
      //     ],
      //   };
      if (result.status != 200 || !result.data.success) {
        this.$router.push({ name: "Home" });
      }
      this.activities = result.data.activities;
    },
    creatPanel() {
      this.$prompt(this.$t("Activity Name"), this.$t("Creat An Activity"), {
        confirmButtonText: this.$t("Yes"),
        cancelButtonText: this.$t("No"),
      })
        .then(async ({ value }) => {
          const result = await this.axios
            .post(this.$rootPath + "/activity/new", {
              name: value,
            })
            .then((data) => data.data);
          if (result.success) {
            this.$message({
              type: "success",
              message: this.$t("Creat Activity:") + " " + value,
            });
            this.getActivityList();
            this.getActivityInfo(result.id);
          } else {
            this.$message({
              type: "error",
              message: this.$t(result.reason),
            });
            this.creatPanel();
          }
        })
        .catch(() => {});
    },
    deleteActivity() {
      this.$confirm(
        this.$t(
          "This operation will delete the activity permanently, continue?"
        ),
        this.$t("Notice"),
        {
          confirmButtonText: this.$t("Yes"),
          cancelButtonText: this.$t("No"),
          type: "warning",
        }
      ).then(async () => {
        const result = await this.axios
          .post(this.$rootPath + "/activity/delete", {
            activity: this.activityId,
          })
          .then((data) => data.data);
        if (result.success) {
          this.$message({
            type: "success",
            message: this.$t("Activity Delete"),
          });
          await this.getActivityList();
          if (!this.hasActivity) {
            this.activityName = this.$t("CREAT");
            this.creatPanel();
          } else {
            this.getActivityInfo(this.activities[0].id);
          }
        }
      });
    },
    async getActivityInfo(id) {
      Cookies.set("activity",id);
      this.activityId = id;
      const result = await this.axios
        .post(this.$rootPath + "/activity/config", {
          activity: id,
        })
        .then((data) => data.data);
      if (result.success) {
        this.activityName = result.data.name;
        this.activityInfo = result.data;
        this.activityEditInfo = JSON.parse(JSON.stringify(this.activityInfo));
        this.activityTokens = [];
        for (const name in this.activityInfo.tokens) {
          this.activityTokens.push({
            name: name,
            token: this.activityInfo.tokens[name].token,
            perms: this.activityInfo.tokens[name].perms,
          });
        }
        for (const perm of this.activityInfo.permList) {
          this.permDescription[perm.name] = perm.description;
        }
        if (!this.activityEditInfo.addons) this.activityEditInfo.addons = {};
        for (const addon of this.activityInfo.addonList) {
          if (!this.activityEditInfo.addons[addon.name])
            this.activityEditInfo.addons[addon.name] = addon.default;
        }
      } else {
        this.$router.push({ name: "Login" });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.menu {
  min-width: 80%;
}
.logo {
  color: #34495e;
  font-size: 24px;
  font-weight: 700;
  transition: color 0.3s;
  -moz-transition: color 0.3s;
  -webkit-transition: color 0.3s;
  -o-transition: color 0.3s;
}
.logo:hover {
  color: #1abc9c;
}
@media screen and (max-width: 550px) {
  .logo {
    display: none;
  }
  .el-menu-item,
  .el-submenu /deep/ .el-submenu__title {
    font-size: 14px;
    font-weight: 500;
  }
}
@media screen and (min-width: 550px) {
  .el-menu-item,
  .el-submenu /deep/ .el-submenu__title {
    font-size: 16px;
    font-weight: 500;
  }
}
.docker-right,
.el-menu--horizontal > .el-menu-item.docker-right {
  float: right;
}
/deep/.el-input.is-disabled > .el-input__inner {
  color: #2c3e50;
}
.container {
  font-size: 24px;
  padding-top: 20px;
  padding-bottom: 20px;
  padding-right: 60px;
  padding-left: 60px;
  line-height: 1em;
  text-align: left;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.col-20 {
  margin-top: 20px;
}
.font-18 {
  font-size: 18px;
}
.margin-0 {
  margin: 0px;
}
.font-16,
/deep/ .el-checkbox__label {
  font-size: 16px;
}
.font-20 {
  font-size: 20px;
}
.height-5 {
  height: 5px;
}
.el-table {
  font-size: 16px;
}
.el-tag {
  margin-right: 3px;
}
/deep/.el-input.is-disabled.pad-right-60 .el-input__inner {
  padding-right: 60px;
}
/deep/.el-input.is-disabled.pad-right-130 .el-input__inner {
  padding-right: 130px;
}

/deep/.el-dialog__body {
  padding: 10px 20px;
}

/deep/.el-checkbox__label {
  display: inline-grid;
  white-space: break-spaces;
}
</style>
