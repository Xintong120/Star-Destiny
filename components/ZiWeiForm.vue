<template>
  <div>
    <!-- 表单抽屉 -->
    <el-drawer v-model="isDrawerOpen" :with-header="false" size="400px">
      <!-- 表单组件，用于收集用户输入的命盘信息 -->
      <div class="form-content">
        <form @submit.prevent="submitForm">
          <!-- 日期类型选择 -->
          <div class="form-item">
            <div class="form-label">
              <span class="required">*</span> 日期类型
            </div>
            <div class="form-input">
              <div class="date-type-selector">
                <button type="button" :class="['date-type-btn', type === 'solar' ? 'active' : '']"
                  @click="type = 'solar'">阳历</button>
                <button type="button" :class="['date-type-btn', type === 'lunar' ? 'active' : '']"
                  @click="type = 'lunar'">农历</button>
              </div>
            </div>
          </div>
          
          <!-- 生日输入 -->
          <div class="form-item">
            <div class="form-label">
              <span class="required">*</span> 生日 <i class="info-icon">?</i>
            </div>
            <div class="form-input">
              <input type="text" v-model="dateStr" placeholder="阳历生日" class="date-input" required />
            </div>
          </div>
          
          <!-- 时辰选择 -->
          <div class="form-item">
            <div class="form-label">
              <span class="required">*</span> 时辰 <i class="info-icon">?</i>
            </div>
            <div class="form-input">
              <div class="time-selector">
                <select v-model="timeIndex" class="time-select">
                  <option v-for="(label, idx) in times" :key="idx" :value="idx">{{ label }}</option>
                </select>
                <i class="select-arrow">▼</i>
              </div>
            </div>
          </div>
          
          <!-- 性别选择 -->
          <div class="form-item">
            <div class="form-label">
              <span class="required">*</span> 性别
            </div>
            <div class="form-input">
              <div class="gender-selector">
                <label class="gender-option">
                  <input type="radio" v-model="gender" value="女" />
                  <span class="gender-label">女</span>
                </label>
                <label class="gender-option">
                  <input type="radio" v-model="gender" value="男" />
                  <span class="gender-label">男</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- 姓名输入 -->
          <div class="form-item">
            <div class="form-label">名字</div>
            <div class="form-input">
              <input type="text" v-model="name" placeholder="请输入姓名（选填）" class="name-input" />
            </div>
          </div>
          
          <!-- 提交按钮 -->
          <div class="form-item submit-area">
            <button type="submit" class="drawer-submit-btn">排盘</button>
          </div>
          
          <!-- 快捷键提示 -->
          <div class="shortcut-tips">
            <span class="tip-item">⌘</span>
            <span class="tip-item">shift</span>
            <span class="tip-item">L</span>
            <span class="tip-text">保存的星盘</span>
          </div>
        </form>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import html2canvas from 'html2canvas';
import { astro } from 'iztro';
import ZiWeiGrid from './ZiWeiGrid.vue';
import { useDrawerStore } from '../src/stores/drawerStore';
import { useAstrolabeStore } from '../src/stores/astrolabeStore';

// 从 store 中获取抽屉状态和操作
const { isDrawerOpen, closeDrawer: closeFormDrawer } = useDrawerStore();
const astrolabeStore = useAstrolabeStore();

// 定义组件向父组件发送的事件
const emit = defineEmits(['submit']);
const router = useRouter();

// 响应式状态声明
const type = ref('solar'); // 日期类型，默认为阳历
const dateStr = ref(''); // 日期字符串
const timeIndex = ref(0); // 时辰索引
const gender = ref('女'); // 性别，默认为女
const name = ref(''); // 姓名，选填

// 时辰选项数组
const times = ['早子时(0-1)', '丑时(1-3)', '寅时(3-5)', '卯时(5-7)', '辰时(7-9)', '巳时(9-11)', '午时(11-13)', '未时(13-15)', '申时(15-17)', '酉时(17-19)', '戌时(19-21)', '亥时(21-23)', '晚子时(23-0)'];

/**
 * 提交表单数据并生成命盘
 */
function submitForm() {
  try {
    let astrolabeData = null;
    // 根据日期类型选择不同的生成方法
    if (type.value === 'solar') {
      // 使用阳历生成命盘
      astrolabeData = astro.bySolar(dateStr.value, timeIndex.value, gender.value);
    } else {
      // 使用农历生成命盘
      astrolabeData = astro.byLunar(dateStr.value, timeIndex.value, gender.value);
    }

    // 将命盘数据存入 Pinia store
    astrolabeStore.setAstrolabe(astrolabeData, name.value);

    // 关闭抽屉
    closeFormDrawer();

    // 跳转到排盘结果页
    router.push('/ziwei');
  } catch (error) {
    console.error('生成命盘时出错:', error);
    // 可以在这里添加错误提示
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #E48FA0;
  position: relative;
  overflow: hidden;
}

.page-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("/星轨.svg");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.2;
  z-index: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px;
  position: relative;
  z-index: 1;
}

/* 命盘图容器样式 */
.grid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
 
}


.form-content {
  padding: 1.25rem;
}

form {
  background-color: #fff;
  border-radius: 0.625rem;
  padding: 1.875rem;
  width: 100%;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.05);
}

.form-item {
  margin-bottom: 1.25rem;
}

.form-label {
  font-size: 0.875rem;
  color: #333;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.required {
  color: #ff4d4f;
  margin-right: 0.25rem;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #666;
  font-size: 0.75rem;
  margin-left: 0.375rem;
  cursor: pointer;
}

.form-input {
  width: 100%;
}

.date-type-selector {
  display: flex;
  border-radius: 0.375rem;
  overflow: hidden;
  border: 1px solid #d9d9d9;
}

.date-type-btn {
  flex: 1;
  padding: 0.5rem 0;
  text-align: center;
  background: #f5f5f5;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.date-type-btn.active {
  background: #72AEC5;
  color: white;
}

.date-input,
.name-input {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d9d9d9;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.time-selector {
  position: relative;
}

.time-select {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d9d9d9;
  border-radius: 0.375rem;
  appearance: none;
  background-color: white;
  font-size: 0.875rem;
}

.select-arrow {
  position: absolute;
  right: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.625rem;
  color: #999;
  pointer-events: none;
}

.gender-selector {
  display: flex;
  gap: 1.25rem;
}

.gender-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.gender-option input {
  margin-right: 0.5rem;
}

.submit-area {
  margin-top: 1.875rem;
}

.drawer-submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #72AEC5;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.drawer-submit-btn:hover {
  background-color: #72AEC5;
}

.shortcut-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.25rem;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #999;
}

.tip-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem 0.375rem;
  background-color: #f5f5f5;
  border-radius: 0.25rem;
  border: 1px solid #ddd;
}

.tip-text {
  color: #666;
}
</style>
