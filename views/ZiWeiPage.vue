<template>
  <div class="ziwei-container">
    <!-- 导航栏 -->
    <NavBar />
    <!-- 命盘生成表单 -->
    <zi-wei-form @submit="onSubmit" />
    <!-- 页脚 -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NavBar from '../components/NavBar.vue';
import AppFooter from '../components/Footer.vue';
import ZiWeiForm from '../components/ZiWeiForm.vue'
import ZiWeiGrid from '../components/ZiWeiGrid.vue'
import html2canvas from 'html2canvas'
import { astro } from 'iztro'
import type { IFunctionalAstrolabe } from '../src/astro/FunctionalAstrolabe'

// 存储紫微命盘对象，初始为 null，生成后赋值
const astrolabe = ref<IFunctionalAstrolabe | null>(null)
// 获取紫微命盘网格组件的引用，用于后续导出图片
const ziweiGrid = ref<InstanceType<typeof ZiWeiGrid> | null>(null)

// 表单提交回调，接收子组件传来的表单数据
const onSubmit = (form: { dateStr: string; timeIndex: number; gender: string; type: string }) => {
  // 这里只以阳历为例，阴历可用 byLunar
  // 根据表单数据生成紫微命盘对象，赋值给 astrolabe
  // @ts-ignore - 暂时忽略类型错误，实际使用时需要确保gender参数的正确性
  astrolabe.value = astro.bySolar(form.dateStr, form.timeIndex, form.gender)
}

// 导出图片功能，将紫微命盘网格导出为PNG图片
const exportImage = async () => {
  if (!ziweiGrid.value) return
  // 获取紫微命盘网格的DOM元素
  const el = ziweiGrid.value.$el
  // 使用 html2canvas 将DOM渲染为canvas
  const canvas = await html2canvas(el)
  // 创建下载链接
  const link = document.createElement('a')
  // 设置图片数据为PNG格式
  link.href = canvas.toDataURL('image/png')
  // 设置下载文件名
  link.download = 'ziwei-chart.png'
  // 触发下载
  link.click()
}
</script>

<style scoped>
.ziwei-container {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  background-color: #E48FA0;
  font-family: sans-serif;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 48px;
  background-color: transparent;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  width: 36px;
  height: 36px;
}

.site-name {
  font-size: 24px;
  color: #72AEC5;
  font-weight: bold;
}

.nav-links span {
  cursor: pointer;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.language-selector,
.theme-switch {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.login-btn {
  background-color: #72AEC5;
  border-color: #72AEC5;
  color: white;
  border-radius: 4px;
  padding: 8px 20px;
}

.page-title {
  text-align: center;
  margin: 20px 0;
}

.page-title h1 {
  font-size: 32px;
  color: #72AEC5;
}





.footer {
  text-align: center;
  padding: 40px 0;
  color: #333;
  font-size: 16px;
  max-width: 600px;
  margin: 0 auto;
}
</style>
