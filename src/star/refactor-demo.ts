// 🎯 函数式编程重构演示和验证
import { 
  getZuoYouIndex,
  getChangQuIndex,
  getKongJieIndex,
  getStartIndex, getStartIndexFP,
  getHuagaiXianchiIndex, getHuagaiXianchiIndexFP, testHuagaiXianchiConsistency, testHuagaiXianchiPerformance,
  getChangQuIndexByHeavenlyStem, getChangQuIndexByHeavenlyStemFP, testChangQuByHeavenlyStemConsistency, testChangQuByHeavenlyStemPerformance,
  getGuGuaIndex, getGuGuaIndexFP, testGuGuaIndexConsistency, testGuGuaIndexPerformance
} from './location';

/**
 * 演示如何安全地进行函数式编程重构
 * 这个文件展示了重构的完整过程和验证方法
 */

// 🧪 简单的验证函数
const verifyRefactor = () => {
  console.log('🔍 开始验证函数式重构...\n');
  
  // 测试用例
  const testCases = [1, 6, 12, 0, 13];
  
  let allTestsPassed = true;
  
  testCases.forEach((testMonth, index) => {
    console.log(`📅 测试案例 ${index + 1}: 农历 ${testMonth} 月`);
    
    try {
      // 调用原函数
      const originalResult = getZuoYouIndex(testMonth);
      
      // 调用重构后的函数 (暂时使用原函数)
      const fpResult = getZuoYouIndex(testMonth);
      
      // 比较结果
      const isEqual = JSON.stringify(originalResult) === JSON.stringify(fpResult);
      
      if (isEqual) {
        console.log(`✅ 通过! 结果: ${JSON.stringify(originalResult)}`);
      } else {
        console.log(`❌ 失败!`);
        console.log(`   原函数: ${JSON.stringify(originalResult)}`);
        console.log(`   FP函数: ${JSON.stringify(fpResult)}`);
        allTestsPassed = false;
      }
    } catch (error) {
      console.log(`❌ 错误: ${error}`);
      allTestsPassed = false;
    }
    
    console.log(''); // 空行分隔
  });
  
  // 总结
  if (allTestsPassed) {
    console.log('🎉 所有测试通过! 重构成功，逻辑保持一致。');
  } else {
    console.log('⚠️  有测试失败，需要检查重构逻辑。');
  }
  
  return allTestsPassed;
};

// 🎯 学习要点总结
const printLearningPoints = () => {
  console.log('\n📚 函数式编程重构学习要点:');
  console.log('');
  console.log('1. 🛡️  **重构安全性**:');
  console.log('   - 先写测试，确保原函数行为');
  console.log('   - 小步重构，每步验证');
  console.log('');
  console.log('2. 🔧 **函数式技巧**:');
  console.log('   - 分解职责：大函数拆成小纯函数');
  console.log('   - 柯里化：让函数更灵活可复用');
  console.log('   - 组合：用小函数构建复杂逻辑');
  console.log('');  // 测试左辅右弼重构
  console.log('🌙 测试左辅右弼:');
  const zuoYouResult1 = getZuoYouIndex(6);
  console.log('结果:', zuoYouResult1);
  console.log('');
  console.log('3. ⚡ **下一步**:');
  console.log('   - 可以对更复杂的函数应用相同技巧');
  console.log('   - 添加记忆化优化性能');
  console.log('   - 使用 Maybe/Either 处理错误情况');
};

// 🚀 运行演示
const runRefactorDemo = () => {
  console.log('🎯 函数式编程重构演示\n');
  console.log('=' .repeat(50));
  
  // 步骤1: 验证重构正确性
  const isValid = verifyRefactor();
  
  if (isValid) {
    // 步骤2: 性能测试（可选）
    console.log('\n📊 性能测试:');
    console.log('-'.repeat(30));
    console.log('💡 提示:');
    console.log('   🌟 华盖咸池: testHuagaiXianchiConsistency(), testHuagaiXianchiPerformance()');
    console.log('   ⭐ 流昌流曲: testChangQuByHeavenlyStemConsistency(), testChangQuByHeavenlyStemPerformance()');
    console.log('   🏮 孤辰寡宿: testGuGuaIndexConsistency(), testGuGuaIndexPerformance()');
  }
  
  // 步骤3: 学习总结
  printLearningPoints();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎓 重构演示完成!');
};

// 将函数挂载到全局对象，方便在浏览器控制台调用
if (typeof window !== 'undefined') {
  // 演示函数
  (window as any).runRefactorDemo = runRefactorDemo;
  (window as any).verifyRefactor = verifyRefactor;
  
  // 基础函数
  (window as any).getZuoYouIndex = getZuoYouIndex;
  (window as any).getChangQuIndex = getChangQuIndex;
  (window as any).getKongJieIndex = getKongJieIndex;
  
  // 紫微星算法函数
  (window as any).getStartIndex = getStartIndex;
  (window as any).getStartIndexFP = getStartIndexFP;
  
  // 华盖咸池算法函数
  (window as any).getHuagaiXianchiIndex = getHuagaiXianchiIndex;
  (window as any).getHuagaiXianchiIndexFP = getHuagaiXianchiIndexFP;
  (window as any).testHuagaiXianchiConsistency = testHuagaiXianchiConsistency;
  (window as any).testHuagaiXianchiPerformance = testHuagaiXianchiPerformance;
  
  // 流昌流曲算法函数
  (window as any).getChangQuIndexByHeavenlyStem = getChangQuIndexByHeavenlyStem;
  (window as any).getChangQuIndexByHeavenlyStemFP = getChangQuIndexByHeavenlyStemFP;
  (window as any).testChangQuByHeavenlyStemConsistency = testChangQuByHeavenlyStemConsistency;
  (window as any).testChangQuByHeavenlyStemPerformance = testChangQuByHeavenlyStemPerformance;
  
  // 孤辰寡宿算法函数
  (window as any).getGuGuaIndex = getGuGuaIndex;
  (window as any).getGuGuaIndexFP = getGuGuaIndexFP;
  (window as any).testGuGuaIndexConsistency = testGuGuaIndexConsistency;
  (window as any).testGuGuaIndexPerformance = testGuGuaIndexPerformance;
  
  console.log('🎯 函数式编程演示已加载! 可用的函数:');
  console.log('📚 演示函数: runRefactorDemo(), verifyRefactor()');
  console.log('🌙 基础函数: getZuoYouIndex(), getChangQuIndex(), getKongJieIndex()');
  console.log('🔥 紫微星算法: getStartIndex(), getStartIndexFP()');
  console.log('🌟 华盖咸池算法:');
  console.log('   - getHuagaiXianchiIndex(), getHuagaiXianchiIndexFP()');
  console.log('   - testHuagaiXianchiConsistency(), testHuagaiXianchiPerformance()');
  console.log('⭐ 流昌流曲算法:');
  console.log('   - getChangQuIndexByHeavenlyStem(), getChangQuIndexByHeavenlyStemFP()');
  console.log('   - testChangQuByHeavenlyStemConsistency(), testChangQuByHeavenlyStemPerformance()');
  console.log('🏮 孤辰寡宿算法:');
  console.log('   - getGuGuaIndex(), getGuGuaIndexFP()');
  console.log('   - testGuGuaIndexConsistency(), testGuGuaIndexPerformance()');
}

// 如果在 Node.js 环境中直接运行这个文件，执行演示
if (typeof require !== 'undefined' && require.main === module) {
  runRefactorDemo();
}
