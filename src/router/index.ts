import { createRouter, createWebHistory, RouteRecordRaw, Router } from "vue-router";
import type { Component } from "vue";

const Home: Component = () => import("../pages/HomePage.vue");
const Products: Component = () => import("../pages/ProductsPage.vue");
const ProductDetails: Component = () => import("../pages/ProductDetails.vue");
const Login: Component = () => import("../pages/LoginPage.vue");
const Register: Component = () => import("../pages/RegisterPage.vue");
const Cart: Component = () => import("../pages/CartPage.vue");
const Wishlist: Component = () => import("../pages/WishlistPage.vue");
const AdminPage: Component = () => import("../pages/AdminPage.vue");
const About: Component = () => import("../pages/AboutPage.vue");
const Contact: Component = () => import("../pages/ContactPage.vue");

const routes: RouteRecordRaw[] = [
  { path: "/", component: Home },
  { path: "/products/:category/:brand", component: Products },
  { path: "/product/:id", component: ProductDetails },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/cart", component: Cart },
  { path: "/wishlist", component: Wishlist },
  { path: "/admin", component: AdminPage, meta: { requiresAuth: true } },
  { path: "/about", component: About },
  { path: "/contact", component: Contact }
];

const router: Router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, _from, next) => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (to.path.startsWith("/admin")) {
    if (!user) {
      alert("برای دسترسی به پنل مدیریت باید وارد شوید.");
      next("/login");
    } else if (user.role !== "admin") {
      alert("شما اجازه دسترسی به پنل مدیریت را ندارید!");
      next("/");
    } else {
      next();
    }
  } else if (to.meta.requiresAuth) {
    if (!user) {
      alert("لطفا ابتدا وارد شوید.");
      next("/login");
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;