/**
 * TypeScript 控制台测试脚本
 * 
 * 使用方法：
 * 1. 安装 ts-node: npm install -g ts-node
 * 2. 运行: npx ts-node test-modules.ts
 * 3. 或者添加到 package.json: "test:modules": "npx ts-node test-modules.ts"
 */

// 直接导入模块进行测试
import { getKuiYueIndex, quickVerifyKuiYue } from './src/star/modules/kui-yue';
import { getZuoYouIndex, getZuoYouIndexFP, quickVerifyZuoYou, verifyZuoYouSymmetry } from './src/star/modules/zuo-you';
import { getKongJieIndex, getKongJieIndexFP, quickVerifyKongJie, verifyKongJieSymmetry, verifyKongJieWithHai } from './src/star/modules/kong-jie';

/**
 * 简单的功能测试
 */
function basicFunctionTests() {
  console.log('\n=== 基础功能测试 ===');
  
  // 测试天魁天钺
  console.log('\n[TEST] 天魁天钺测试:');
  const kuiYueResult = getKuiYueIndex('甲');
  console.log(`甲干 - 天魁: ${kuiYueResult.kuiIndex}, 天钺: ${kuiYueResult.yueIndex}`);
  
  // 测试左辅右弼
  console.log('\n[TEST] 左辅右弼测试:');
  const zuoYouResult = getZuoYouIndex(1);
  const zuoYouFPResult = getZuoYouIndexFP(1);
  console.log(`正月 - 左辅: ${zuoYouResult.zuoIndex}, 右弼: ${zuoYouResult.youIndex}`);
  console.log(`正月FP - 左辅: ${zuoYouFPResult.zuoIndex}, 右弼: ${zuoYouFPResult.youIndex}`);
  console.log(`一致性: ${JSON.stringify(zuoYouResult) === JSON.stringify(zuoYouFPResult) ? '[PASS]' : '[FAIL]'}`);
  
  // 测试地空地劫
  console.log('\n[TEST] 地空地劫测试:');
  const kongJieResult = getKongJieIndex(0);
  const kongJieFPResult = getKongJieIndexFP(0);
  console.log(`子时 - 地空: ${kongJieResult.kongIndex}, 地劫: ${kongJieResult.jieIndex}`);
  console.log(`子时FP - 地空: ${kongJieFPResult.kongIndex}, 地劫: ${kongJieFPResult.jieIndex}`);
  console.log(`一致性: ${JSON.stringify(kongJieResult) === JSON.stringify(kongJieFPResult) ? '[PASS]' : '[FAIL]'}`);
}

/**
 * 详细验证测试
 */
function detailedVerificationTests() {
  console.log('\n=== 详细验证测试 ===');
  
  try {
    // 天魁天钺详细验证
    quickVerifyKuiYue();
    
    // 左辅右弼详细验证
    quickVerifyZuoYou();
    verifyZuoYouSymmetry();
    
    // 地空地劫详细验证
    quickVerifyKongJie();
    verifyKongJieSymmetry();
    verifyKongJieWithHai();
    
  } catch (error) {
    console.error('[ERROR] 详细验证失败:', error);
  }
}

/**
 * 性能对比测试
 */
function performanceTests() {
  console.log('\n=== 性能对比测试 ===');
  
  const iterations = 1000;
  
  // 左辅右弼性能测试
  console.log('\n[PERF] 左辅右弼性能测试:');
  const startTime1 = performance.now();
  for (let i = 0; i < iterations; i++) {
    getZuoYouIndex(6);
  }
  const endTime1 = performance.now();
  
  const startTime2 = performance.now();
  for (let i = 0; i < iterations; i++) {
    getZuoYouIndexFP(6);
  }
  const endTime2 = performance.now();
  
  console.log(`原版耗时: ${(endTime1 - startTime1).toFixed(2)}ms`);
  console.log(`FP版耗时: ${(endTime2 - startTime2).toFixed(2)}ms`);
  console.log(`性能提升: ${(((endTime1 - startTime1) - (endTime2 - startTime2)) / (endTime1 - startTime1) * 100).toFixed(2)}%`);
  
  // 地空地劫性能测试
  console.log('\n[PERF] 地空地劫性能测试:');
  const startTime3 = performance.now();
  for (let i = 0; i < iterations; i++) {
    getKongJieIndex(6);
  }
  const endTime3 = performance.now();
  
  const startTime4 = performance.now();
  for (let i = 0; i < iterations; i++) {
    getKongJieIndexFP(6);
  }
  const endTime4 = performance.now();
  
  console.log(`原版耗时: ${(endTime3 - startTime3).toFixed(2)}ms`);
  console.log(`FP版耗时: ${(endTime4 - startTime4).toFixed(2)}ms`);
  console.log(`性能提升: ${(((endTime3 - startTime3) - (endTime4 - startTime4)) / (endTime3 - startTime3) * 100).toFixed(2)}%`);
}

/**
 * 主测试函数
 */
function runAllTests() {
  console.log('[INFO] 开始模块拆分测试...');
  console.log('[INFO] 测试时间:', new Date().toLocaleString());
  
  try {
    basicFunctionTests();
    detailedVerificationTests();
    performanceTests();
    
    console.log('\n[SUCCESS] 所有测试完成！');
    console.log('[INFO] 模块拆分成功，功能正常！');
    
  } catch (error) {
    console.error('\n[ERROR] 测试过程中出现错误:', error);
    console.log('\n[HELP] 请检查：');
    console.log('1. 模块文件是否存在');
    console.log('2. 导入路径是否正确');
    console.log('3. 依赖是否正确安装');
  }
}

// 运行测试
runAllTests();
