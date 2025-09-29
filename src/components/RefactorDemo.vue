<template>
  <div class="refactor-demo">
    <h2>🎯 函数式编程重构演示</h2>
    
    <div class="demo-buttons">
      <el-button type="primary" @click="runDemo" :loading="isRunning">
        🚀 运行重构演示
      </el-button>
      
      <el-button type="success" @click="runVerification">
        ✅ 验证重构正确性
      </el-button>
      
      <el-button type="info" @click="runPerformanceTest">
        📊 性能测试
      </el-button>
      
      <el-button @click="clearConsole">
        🧹 清空控制台
      </el-button>
    </div>
    
    <div class="instructions">
      <h3>📖 使用说明</h3>
      <ul>
        <li><strong>运行重构演示</strong>：完整展示函数式编程重构过程</li>
        <li><strong>验证重构正确性</strong>：确保新旧函数行为一致</li>
        <li><strong>性能测试</strong>：对比重构前后的性能</li>
        <li><strong>清空控制台</strong>：清理控制台输出</li>
      </ul>
      
      <div class="tip">
        💡 <strong>提示</strong>：打开浏览器开发者工具的控制台（F12）查看详细输出
      </div>
    </div>
    
    <div class="learning-points">
      <h3>🎓 学习要点</h3>
      <div class="points-grid">
        <div class="point">
          <h4>🛡️ 重构安全性</h4>
          <p>通过测试确保重构不改变原有逻辑</p>
        </div>
        <div class="point">
          <h4>🔧 函数式技巧</h4>
          <p>分解职责、柯里化、函数组合</p>
        </div>
        <div class="point">
          <h4>📈 代码质量</h4>
          <p>更好的可读性、可测试性、可复用性</p>
        </div>
        <div class="point">
          <h4>⚡ 性能优化</h4>
          <p>记忆化、惰性求值等优化技巧</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { runRefactorDemo } from '../star/refactor-demo';
import { getZuoYouIndex, getZuoYouIndexFP, testZuoYouPerformance } from '../star/location';

const isRunning = ref(false);

const runDemo = async () => {
  isRunning.value = true;
  console.log('🎯 开始函数式编程重构演示...');
  console.log('='.repeat(60));
  
  try {
    runRefactorDemo();
  } catch (error) {
    console.error('❌ 演示运行出错:', error);
  } finally {
    isRunning.value = false;
  }
};

const runVerification = () => {
  console.log('🔍 开始验证重构正确性...');
  console.log('-'.repeat(40));
  
  const testCases = [1, 6, 12, 0, 13];
  let allPassed = true;
  
  testCases.forEach((testMonth, index) => {
    console.log(`📅 测试案例 ${index + 1}: 农历 ${testMonth} 月`);
    
    const originalResult = getZuoYouIndex(testMonth);
    const fpResult = getZuoYouIndexFP(testMonth);
    
    const isEqual = JSON.stringify(originalResult) === JSON.stringify(fpResult);
    
    if (isEqual) {
      console.log(`✅ 通过! 结果: ${JSON.stringify(originalResult)}`);
    } else {
      console.log(`❌ 失败!`);
      console.log(`   原函数: ${JSON.stringify(originalResult)}`);
      console.log(`   FP函数: ${JSON.stringify(fpResult)}`);
      allPassed = false;
    }
  });
  
  console.log('\n' + (allPassed ? '🎉 所有测试通过!' : '⚠️ 有测试失败'));
};

const runPerformanceTest = () => {
  console.log('📊 开始性能测试...');
  console.log('-'.repeat(30));
  
  try {
    testZuoYouPerformance();
  } catch (error) {
    console.error('❌ 性能测试出错:', error);
  }
};

const clearConsole = () => {
  console.clear();
  console.log('🧹 控制台已清空');
  console.log('💡 准备好开始新的演示了！');
};
</script>

<style scoped>
.refactor-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.demo-buttons {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.instructions {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.instructions h3 {
  margin-top: 0;
  color: #409eff;
}

.instructions ul {
  margin: 10px 0;
}

.instructions li {
  margin: 8px 0;
}

.tip {
  background: #e6f7ff;
  padding: 10px;
  border-radius: 4px;
  border-left: 4px solid #1890ff;
  margin-top: 15px;
}

.learning-points {
  margin-top: 30px;
}

.learning-points h3 {
  color: #52c41a;
}

.points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.point {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.point h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.point p {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}
</style>
