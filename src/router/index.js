import { createRouter, createWebHistory } from 'vue-router'
import ZiWeiPage from '../../views/ZiWeiPage.vue'
import HomePage from '../../components/HomePage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/ziwei',
    name: 'ZiWeiPage',
    component: ZiWeiPage
  }
]

export default routes 