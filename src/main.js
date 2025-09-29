import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
// 导入持久化插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import "normalize.css";
import "./assets/styles.scss";

// 🎯 导入函数式编程重构演示（开发环境）
if (import.meta.env.DEV) {
  import('./star/refactor-demo.ts').then(() => {
    console.log('🎓 函数式编程重构演示已加载！');
    console.log('💡 在浏览器控制台输入以下命令来体验：');
    console.log('   runRefactorDemo() - 运行完整演示');
    console.log('   verifyRefactor() - 仅验证重构正确性');
  });
}

const pinia = createPinia()
// 使用持久化插件
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router).use(ElementPlus).use(pinia).mount('#app')
