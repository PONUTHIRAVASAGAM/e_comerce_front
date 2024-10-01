import Vue from 'vue';
import Router from 'vue-router';

// Import your components
// import Home from './components/Home.vue';
import LoginPage from '../components/LoginPage.vue';
import UserPage from '../components/UserPage.vue';
import AdminPage from '../components/AdminPage.vue';

// Tell Vue to use Vue Router
Vue.use(Router);

// Define your routes
const routes = [
//   { path: '/', component: Home },
//   { path: '/about', component: About },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
  },
  {
    path: "/e_comerce",
    name: "userHome",
    component: UserPage,
  },
  {
    path: "/user/:userId",
    name: "userDetails",
    component: UserPage,
    meta: { requiresAuth: true }
  },
  // { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  {
    path: "/admin/:userId",
    name: "adminDetails",
    component: AdminPage,
    meta: { requiresAuth: true }
  },
];

// Create and export the router instance
const router = new Router({
  mode: 'history', // Use HTML5 History API for cleaner URLs
  routes,
});

// router.beforeEach((to, from, next) => {
  // const token = localStorage.getItem('jwtToken'); // Replace 'token' with your token key
// 
  // if (to.matched.some(record => record.meta.requiresAuth) && !token) {
      // If the route requires auth and there is no token, redirect to login
      // next({ path: '/login' });
  // } else {
      // next(); // Allow access
  // }
// });

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('jwtToken'); // Replace 'jwtToken' with your actual token key

  // Check if the route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      // If the route requires auth and there is no token, redirect to the login page
      if (to.path !== '/login') { // Prevent looping if already on the login page
        next({ path: '/login' });
      } else {
        next(); // Stay on the login page if already there
      }
    } else {
      next(); // Token exists, proceed to the route
    }
  } else {
    next(); // Route does not require auth, proceed
  }
});

export default router;
