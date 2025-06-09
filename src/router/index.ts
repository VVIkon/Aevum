import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import { ROUTES_PATHS } from '@/constants'
import { useAuth } from '@/module/auth/composable/useAuth'
import MesSendo from '@/module/messendo/pages/MesSendo.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: ROUTES_PATHS.HOME,
    //   name: ROUTES_PATHS.HOME,
    //   component: HomeView,
    //   meta: { requiresAuth: false }
    // },
    {
      path: ROUTES_PATHS.HOME,
      name: ROUTES_PATHS.HOME,
      component: MesSendo,
      meta: { requiresAuth: true },
    },
    {
      path: ROUTES_PATHS.LOGIN,
      name: ROUTES_PATHS.LOGIN,
      component: LoginView,
      meta: { requiresAuth: false },
    },
    // {
    //   path: ROUTES_PATHS.ABOUT,
    //   name: ROUTES_PATHS.ABOUT,
    //   component: () => import('../views/AboutView.vue'),
    //   meta: { requiresAuth: false}
    // },
  ],
})

router.beforeEach((to, from, next) => {
  const { isTokenated } = useAuth()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  // console.log('>>> 00 isTokenated: ', isTokenated.value);
  // console.log('>>> requiresAuth: ', requiresAuth);

  if (requiresAuth && !isTokenated.value) {
    next(ROUTES_PATHS.LOGIN)
    // } else if (!requiresAuth && isTokenated.value) {
    //   next(ROUTES_PATHS.HOME)
  } else {
    next()
  }
})

export default router
