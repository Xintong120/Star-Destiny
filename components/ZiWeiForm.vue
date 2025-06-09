<template>
  <div class="page-container">
    <!-- 主内容区 - 显示命盘结果 -->
    <div class="main-content">
      <!-- 命盘图显示区域 - 条件渲染 -->
      <div class="grid-container" v-if="astrolabe">
        <zi-wei-grid :astrolabe="astrolabe" :person-name="name" ref="ziweiGrid" />
      </div>
    </div>

    <!-- 表单抽屉 -->
    <el-drawer v-model="drawer" :with-header="false" size="400px">
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
import html2canvas from 'html2canvas';
import { astro } from 'iztro';
import ZiWeiGrid from './ZiWeiGrid.vue';

// 抽屉显示状态
const drawer = ref(false);

// 定义组件向父组件发送的事件
const emit = defineEmits(['submit']);

// 响应式状态声明
const type = ref('solar'); // 日期类型，默认为阳历
const dateStr = ref(''); // 日期字符串
const timeIndex = ref(0); // 时辰索引
const gender = ref('女'); // 性别，默认为女
const name = ref(''); // 姓名，选填

// 存储紫微命盘对象
const astrolabe = ref(null);
// 获取紫微命盘网格组件的引用，用于导出图片
const ziweiGrid = ref(null);

// 时辰选项数组
const times = ['早子时(0-1)', '丑时(1-3)', '寅时(3-5)', '卯时(5-7)', '辰时(7-9)', '巳时(9-11)', '午时(11-13)', '未时(13-15)', '申时(15-17)', '酉时(17-19)', '戌时(19-21)', '亥时(21-23)', '晚子时(23-0)'];

/**
 * 提交表单数据并生成命盘
 */
function submitForm() {
  // 收集表单数据
  const formData = {
    type: type.value,
    dateStr: dateStr.value,
    timeIndex: timeIndex.value,
    gender: gender.value,
    name: name.value
  };
  
  // 根据表单数据生成紫微命盘
  generateAstrolabe(formData);
  
  // 向父组件发送事件，便于父组件了解状态变化
  emit('submit', formData);
  
  // 关闭抽屉
  drawer.value = false;
}

/**
 * 生成紫微命盘
 * @param {Object} formData - 表单数据
 */
function generateAstrolabe(formData) {
  try {
    // 根据日期类型选择不同的生成方法
    if (formData.type === 'solar') {
      // 使用阳历生成命盘
      astrolabe.value = astro.bySolar(formData.dateStr, formData.timeIndex, formData.gender);
    } else {
      // 使用农历生成命盘
      astrolabe.value = astro.byLunar(formData.dateStr, formData.timeIndex, formData.gender);
    }
  } catch (error) {
    console.error('生成命盘时出错:', error);
    // 可以在这里添加错误提示
  }
}

/**
 * 打开抽屉方法，可以被父组件调用
 */
function openDrawer() {
  drawer.value = true;
}

/**
 * 关闭抽屉方法，可以被父组件调用
 */
function closeDrawer() {
  drawer.value = false;
}

/**
 * 重置命盘数据
 */
function resetAstrolabe() {
  astrolabe.value = null;
}

// 组件挂载时自动打开抽屉
onMounted(() => {
  // 页面加载后稍微延迟一下再打开抽屉，体验更好
  setTimeout(() => {
    drawer.value = true;
  }, 300);
});

// 导出方法供父组件调用
defineExpose({
  openDrawer,
  closeDrawer,
  resetAstrolabe,
  astrolabe
});
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
  padding: 20px;
}

form {
  background-color: #fff;
  border-radius: 10px;
  padding: 30px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.required {
  color: #ff4d4f;
  margin-right: 4px;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #666;
  font-size: 12px;
  margin-left: 6px;
  cursor: pointer;
}

.form-input {
  width: 100%;
}

.date-type-selector {
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #d9d9d9;
}

.date-type-btn {
  flex: 1;
  padding: 8px 0;
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
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
}

.time-selector {
  position: relative;
}

.time-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  appearance: none;
  background-color: white;
  font-size: 14px;
}

.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #999;
  pointer-events: none;
}

.gender-selector {
  display: flex;
  gap: 20px;
}

.gender-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.gender-option input {
  margin-right: 8px;
}

.submit-area {
  margin-top: 30px;
}

.drawer-submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #72AEC5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
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
  margin-top: 20px;
  gap: 8px;
  font-size: 12px;
  color: #999;
}

.tip-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  background-color: #f5f5f5;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.tip-text {
  color: #666;
}
</style>
