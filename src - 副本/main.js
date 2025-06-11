import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './router/index.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
// 导入持久化插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import "normalize.css";
import "./assets/styles.scss";

const router = createRouter({
  history: createWebHistory(),
  routes
})

const pinia = createPinia()
// 使用持久化插件
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router).use(ElementPlus).use(pinia).mount('#app')
