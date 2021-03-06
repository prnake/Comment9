import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Manage from "../views/Manage.vue";
import Wall from "../views/Wall.vue";
import Sender from "../views/Sender.vue";
import Audit from "../views/Audit.vue";
import List from "../views/List.vue";
import Player from "../views/Player.vue";
import NotFound from "../views/NotFound.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    redirect: { name: "Login" },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/manage",
    name: "Manage",
    component: Manage,
  },
  {
    path: "/manage/:id",
    name: "Manage",
    component: Manage,
  },
  {
    path: "/wall/test",
    name: "Test Wall",
    component: Wall,
  },
  {
    path: "/wall/:id/:name/:token?",
    name: "Wall",
    component: Wall,
  },
  {
    path: "/list/test",
    name: "Test List",
    component: List,
    props: (route) => ({ strConfig: route.query }),
  },
  {
    path: "/list/:id/:name/:token?",
    name: "LIST",
    component: List,
    props: (route) => ({ strConfig: route.query }),
  },
  {
    path: "/sender/:id/:name/:token?",
    name: "Sender",
    component: Sender,
  },
  {
    path: "/audit/:id/:name/:token?",
    name: "Audit",
    component: Audit,
  },
  {
    path: "/player/test",
    name: "Test Player",
    component: Player,
  },
  {
    path: "/player/:id/:name/:token?",
    name: "Player",
    component: Player,
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
  { path: "*", component: NotFound },
];

const router = new VueRouter({
  routes,
});

// router.beforeEach((to, from, next) => {
//   if (to.name != 'Login') {
//     store.dispatch('checkLogin')
//   }
//   next()
// });

export default router;
