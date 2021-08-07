<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
    <HelloI18n />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import HelloI18n from "@/components/HelloI18n.vue";

export default {
  name: "Home",
  components: {
    HelloWorld,
    HelloI18n,
  },
};
</script>
