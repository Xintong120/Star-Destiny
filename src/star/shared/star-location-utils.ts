/**
 * 星曜位置计算共享工具模块
 * 
 * 提供所有星曜位置计算模块共用的工具函数和类型定义
 * 从 location.ts 中提取，确保代码复用和一致性
 */

import { fixEarthlyBranchIndex, fixIndex } from '../../utils';
import { 
  EarthlyBranchKey, 
  EarthlyBranchName, 
  HeavenlyStemKey, 
  HeavenlyStemName,
  kot
} from '../../i18n';

// ==================== 类型定义 ====================

/**
 * 星曜位置计算结果的通用接口
 */
export interface StarPositionResult {
  [key: string]: number;
}

/**
 * 双星位置结果接口
 */
export interface DualStarPosition {
  [key: string]: number;
}

// ==================== 通用工具函数 ====================

/**
 * 标准化时辰索引
 * 职责：确保时辰索引在有效范围内
 * @param timeIndex 时辰索引
 * @returns 标准化后的时辰索引
 */
export const normalizeTimeIndex = (timeIndex: number): number => fixIndex(timeIndex);

/**
 * 获取基础宫位索引
 * 职责：根据地支名称获取对应的宫位索引
 * @param earthlyBranch 地支名称
 * @returns 宫位索引
 */
export const getBasePosition = (earthlyBranch: EarthlyBranchName): number => 
  fixEarthlyBranchIndex(earthlyBranch);

/**
 * 转换地支名称为内部键值
 * @param earthlyBranchName 地支名称
 * @returns 地支键值
 */
export const convertEarthlyBranchToKey = (earthlyBranchName: EarthlyBranchName): EarthlyBranchKey =>
  kot<EarthlyBranchKey>(earthlyBranchName, 'Earthly');

/**
 * 转换天干名称为内部键值
 * @param heavenlyStemName 天干名称
 * @returns 天干键值
 */
export const convertHeavenlyStemToKey = (heavenlyStemName: HeavenlyStemName): HeavenlyStemKey =>
  kot<HeavenlyStemKey>(heavenlyStemName, 'Heavenly');

// ==================== 高阶计算函数 ====================

/**
 * 计算顺时针星曜索引的柯里化函数
 * 职责：从基础位置顺时针计算到目标位置
 * @param basePosition 起始宫位
 * @returns 返回一个接受偏移量的函数
 */
export const calculateForwardStarIndex = (basePosition: EarthlyBranchName) => 
  (offset: number): number => fixIndex(getBasePosition(basePosition) + offset);

/**
 * 计算逆时针星曜索引的柯里化函数
 * 职责：从基础位置逆时针计算到目标位置
 * @param basePosition 起始宫位
 * @returns 返回一个接受偏移量的函数
 */
export const calculateReverseStarIndex = (basePosition: EarthlyBranchName) => 
  (offset: number): number => fixIndex(getBasePosition(basePosition) - offset);

// ==================== 映射表查找工具 ====================

/**
 * 通用映射表查找函数
 * @param mapping 映射表
 * @param key 查找键
 * @returns 映射值
 */
export const lookupFromMapping = <K extends string | number | symbol, V>(
  mapping: Record<K, V>,
  key: K
): V => mapping[key];

/**
 * 安全的映射表查找函数，带默认值
 * @param mapping 映射表
 * @param key 查找键
 * @param defaultValue 默认值
 * @returns 映射值或默认值
 */
export const safeLookupFromMapping = <K extends string | number | symbol, V>(
  mapping: Record<K, V>,
  key: K,
  defaultValue: V
): V => mapping[key] ?? defaultValue;

// ==================== 验证和测试工具 ====================

/**
 * 比较两个计算结果是否一致
 * @param result1 结果1
 * @param result2 结果2
 * @returns 是否一致
 */
export const compareResults = (result1: any, result2: any): boolean => 
  JSON.stringify(result1) === JSON.stringify(result2);

/**
 * 性能测试工具函数
 * @param testFunction 要测试的函数
 * @param iterations 迭代次数
 * @param args 函数参数
 * @returns 执行时间（毫秒）
 */
export const measurePerformance = <T extends any[], R>(
  testFunction: (...args: T) => R,
  iterations: number,
  ...args: T
): number => {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    testFunction(...args);
  }
  const end = performance.now();
  return end - start;
};

/**
 * 批量测试函数一致性
 * @param testCases 测试用例数组
 * @param originalFunction 原函数
 * @param newFunction 新函数
 * @param functionName 函数名称（用于日志）
 * @returns 是否所有测试都通过
 */
export const batchTestConsistency = <T, R>(
  testCases: T[],
  originalFunction: (input: T) => R,
  newFunction: (input: T) => R,
  functionName: string
): boolean => {
  console.log(`[INFO] 开始验证 ${functionName} 重构一致性...`);
  
  let allConsistent = true;
  
  testCases.forEach((testCase, index) => {
    const originalResult = originalFunction(testCase);
    const newResult = newFunction(testCase);
    
    const isConsistent = compareResults(originalResult, newResult);
    allConsistent = allConsistent && isConsistent;
    
    console.log(`${index + 1}. ${testCase}: ${isConsistent ? '[PASS]' : '[FAIL]'}`);
    if (!isConsistent) {
      console.log(`   原版: ${JSON.stringify(originalResult)}`);
      console.log(`   新版: ${JSON.stringify(newResult)}`);
    }
  });
  
  console.log(`\n[RESULT] 总体结果: ${allConsistent ? '[PASS] 完全一致' : '[FAIL] 存在差异'}`);
  return allConsistent;
};

/**
 * 批量性能测试
 * @param testCases 测试用例数组
 * @param originalFunction 原函数
 * @param newFunction 新函数
 * @param functionName 函数名称
 * @param iterations 每个测试用例的迭代次数
 */
export const batchTestPerformance = <T, R>(
  testCases: T[],
  originalFunction: (input: T) => R,
  newFunction: (input: T) => R,
  functionName: string,
  iterations: number = 10000
): void => {
  console.log(`[INFO] 开始 ${functionName} 性能测试...`);
  
  let totalOriginalTime = 0;
  let totalNewTime = 0;
  
  testCases.forEach((testCase, index) => {
    console.log(`\n[TEST] 测试案例 ${index + 1}: ${testCase}`);
    
    // 验证结果一致性
    const originalResult = originalFunction(testCase);
    const newResult = newFunction(testCase);
    const isConsistent = compareResults(originalResult, newResult);
    
    console.log(`结果一致性: ${isConsistent ? '[PASS]' : '[FAIL]'}`);
    console.log(`原版结果: ${JSON.stringify(originalResult)}`);
    console.log(`新版结果: ${JSON.stringify(newResult)}`);
    
    if (isConsistent) {
      // 性能测试
      const originalTime = measurePerformance(originalFunction, iterations, testCase);
      const newTime = measurePerformance(newFunction, iterations, testCase);
      
      totalOriginalTime += originalTime;
      totalNewTime += newTime;
      
      // 计算性能提升
      const improvement = ((originalTime - newTime) / originalTime * 100);
      const speedup = originalTime / newTime;
      
      console.log(`[TIME] 原版耗时: ${originalTime.toFixed(2)}ms`);
      console.log(`[TIME] 新版耗时: ${newTime.toFixed(2)}ms`);
      console.log(`[PERF] 性能提升: ${improvement.toFixed(2)}%`);
      console.log(`[PERF] 速度倍数: ${speedup.toFixed(2)}x`);
    }
  });
  
  // 总体性能统计
  const totalImprovement = ((totalOriginalTime - totalNewTime) / totalOriginalTime * 100);
  const totalSpeedup = totalOriginalTime / totalNewTime;
  
  console.log('\n[SUMMARY] 总体性能统计:');
  console.log(`[TIME] 原版总耗时: ${totalOriginalTime.toFixed(2)}ms`);
  console.log(`[TIME] 新版总耗时: ${totalNewTime.toFixed(2)}ms`);
  console.log(`[PERF] 平均性能提升: ${totalImprovement.toFixed(2)}%`);
  console.log(`[PERF] 平均速度倍数: ${totalSpeedup.toFixed(2)}x`);
  
  console.log(`\n[DONE] ${functionName} 性能测试完成！`);
};
