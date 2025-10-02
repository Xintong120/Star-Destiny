/**
 * 模块拆分测试文件
 * 
 * 用于验证拆分后的模块是否正常工作
 * 确保与原 location.ts 的功能保持一致
 */

// 导入拆分后的模块
import { getKuiYueIndex, testKuiYueConsistency, quickVerifyKuiYue } from './kui-yue';
import { getZuoYouIndex, getZuoYouIndexFP, testZuoYouConsistency, quickVerifyZuoYou } from './zuo-you';
import { getKongJieIndex, getKongJieIndexFP, testKongJieConsistency, quickVerifyKongJie } from './kong-jie';

// 导入原 location.ts 中的对应函数进行对比
import { 
  getKuiYueIndexFP as originalKuiYue,
  getZuoYouIndex as originalZuoYou,
  getZuoYouIndexFP as originalZuoYouFP,
  getKongJieIndex as originalKongJie
} from '../location';

/**
 * 测试天魁天钺模块
 */
export const testKuiYueModule = (): void => {
  console.log('\n=== 测试天魁天钺模块 ===');
  
  // 快速验证
  quickVerifyKuiYue();
  
  // 与原函数对比测试
  const testStems = ['甲', '乙', '丙', '丁', '戊'] as const;
  console.log('\n[INFO] 与原函数对比测试:');
  
  testStems.forEach(stem => {
    const newResult = getKuiYueIndex(stem);
    const originalResult = originalKuiYue(stem);
    const isConsistent = JSON.stringify(newResult) === JSON.stringify(originalResult);
    
    console.log(`${stem}干: ${isConsistent ? '[PASS]' : '[FAIL]'}`);
    if (!isConsistent) {
      console.log(`  新版: ${JSON.stringify(newResult)}`);
      console.log(`  原版: ${JSON.stringify(originalResult)}`);
    }
  });
};

/**
 * 测试左辅右弼模块
 */
export const testZuoYouModule = (): void => {
  console.log('\n=== 测试左辅右弼模块 ===');
  
  // 快速验证
  quickVerifyZuoYou();
  
  // 与原函数对比测试
  const testMonths = [1, 6, 12];
  console.log('\n[INFO] 与原函数对比测试:');
  
  testMonths.forEach(month => {
    const newResult = getZuoYouIndex(month);
    const newFPResult = getZuoYouIndexFP(month);
    const originalResult = originalZuoYou(month);
    const originalFPResult = originalZuoYouFP(month);
    
    const isConsistent1 = JSON.stringify(newResult) === JSON.stringify(originalResult);
    const isConsistent2 = JSON.stringify(newFPResult) === JSON.stringify(originalFPResult);
    const isConsistent3 = JSON.stringify(newResult) === JSON.stringify(newFPResult);
    
    console.log(`${month}月 原版: ${isConsistent1 ? '[PASS]' : '[FAIL]'}`);
    console.log(`${month}月 FP版: ${isConsistent2 ? '[PASS]' : '[FAIL]'}`);
    console.log(`${month}月 内部一致: ${isConsistent3 ? '[PASS]' : '[FAIL]'}`);
  });
  
  // 运行一致性测试
  testZuoYouConsistency();
};

/**
 * 测试地空地劫模块
 */
export const testKongJieModule = (): void => {
  console.log('\n=== 测试地空地劫模块 ===');
  
  // 快速验证
  quickVerifyKongJie();
  
  // 与原函数对比测试
  const testTimes = [0, 6, 12];
  console.log('\n[INFO] 与原函数对比测试:');
  
  testTimes.forEach(timeIndex => {
    const newResult = getKongJieIndex(timeIndex);
    const newFPResult = getKongJieIndexFP(timeIndex);
    const originalResult = originalKongJie(timeIndex);
    
    const isConsistent1 = JSON.stringify(newResult) === JSON.stringify(originalResult);
    const isConsistent2 = JSON.stringify(newResult) === JSON.stringify(newFPResult);
    
    console.log(`${timeIndex}时 原版: ${isConsistent1 ? '[PASS]' : '[FAIL]'}`);
    console.log(`${timeIndex}时 内部一致: ${isConsistent2 ? '[PASS]' : '[FAIL]'}`);
  });
  
  // 运行一致性测试
  testKongJieConsistency();
};

/**
 * 运行所有模块测试
 */
export const runAllModuleTests = (): void => {
  console.log('[INFO] 开始运行所有模块测试...');
  
  try {
    testKuiYueModule();
    testZuoYouModule();
    testKongJieModule();
    
    console.log('\n[SUCCESS] 所有模块测试完成！');
  } catch (error) {
    console.error('\n[ERROR] 模块测试失败:', error);
  }
};

// 如果直接运行此文件，执行所有测试
if (require.main === module) {
  runAllModuleTests();
}
