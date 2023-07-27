import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/ExemploView.vue')
    },
    {
      path: '/exemplo',
      name: 'exemplo',
      component: () => import('../views/ExemploView.vue')
    }
  ]
})

export default router
