import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../../components/HomePage.vue'
import ZiWeiPage from '../../components/ZiWeiPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/ziwei',
    name: 'ZiWei',
    component: ZiWeiPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 