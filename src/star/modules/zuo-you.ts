/**
 * 左辅右弼星曜位置计算模块
 * 
 * 职责：
 * - 根据农历月份计算左辅右弼的位置
 * - 提供原版和函数式两种实现
 * - 包含完整的测试和性能验证
 * 
 * 算法说明：
 * - 辰上顺正寻左辅：从辰宫顺数农历月份数是左辅的索引
 * - 戌上逆正右弼当：从戌宫逆数农历月份数是右弼的索引
 */

import { fixIndex, fixEarthlyBranchIndex } from '../../utils';
import { EarthlyBranchName } from '../../i18n';
import { 
  calculateForwardStarIndex,
  calculateReverseStarIndex,
  batchTestConsistency,
  batchTestPerformance
} from '../shared/star-location-utils';

// ==================== 类型定义 ====================

/**
 * 左辅右弼位置结果
 */
export interface ZuoYouPosition {
  /** 左辅索引 */
  zuoIndex: number;
  /** 右弼索引 */
  youIndex: number;
}

// ==================== 辅助函数 ====================

/**
 * 计算月份偏移量
 * 职责：将农历月份转换为计算偏移量（月份-1）
 * @param lunarMonth 农历月份（1-12）
 * @returns 偏移量（0-11）
 */
const calculateMonthOffset = (lunarMonth: number): number => lunarMonth - 1;

// ==================== 核心计算函数 ====================

/**
 * 获取左辅右弼的索引 - 原版实现
 * 保持与原 location.ts 完全一致的实现
 * 
 * @param lunarMonth 农历月份（1-12）
 * @returns 左辅、右弼索引
 */
export const getZuoYouIndex = (lunarMonth: number): ZuoYouPosition => {
  const zuoIndex = fixIndex(fixEarthlyBranchIndex('chen') + (lunarMonth - 1));
  const youIndex = fixIndex(fixEarthlyBranchIndex('xu') - (lunarMonth - 1));

  return { zuoIndex, youIndex };
};

/**
 * 获取左辅右弼的索引 - 函数式版本
 * 
 * 优势：
 * 1. 使用高阶函数，逻辑更清晰
 * 2. 消除重复计算，提高性能
 * 3. 函数式编程，易于测试和维护
 * 
 * @param lunarMonth 农历月份（1-12）
 * @returns 左辅、右弼索引
 */
export const getZuoYouIndexFP = (lunarMonth: number): ZuoYouPosition => {
  // 步骤1：计算月份偏移量，只计算一次
  const offset = calculateMonthOffset(lunarMonth);
  
  // 步骤2：并行计算两个星曜位置，逻辑清晰
  return {
    // 左辅：从辰宫顺时针计算
    zuoIndex: calculateForwardStarIndex('chen' as EarthlyBranchName)(offset),
    // 右弼：从戌宫逆时针计算  
    youIndex: calculateReverseStarIndex('xu' as EarthlyBranchName)(offset)
  };
};

// ==================== 测试和验证函数 ====================

/**
 * 测试用例：12个农历月份
 */
const TEST_LUNAR_MONTHS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * 验证左辅右弼计算的一致性
 * 对比原版实现和函数式实现的结果
 * 
 * @returns 是否所有测试都通过
 */
export const testZuoYouConsistency = (): boolean => {
  return batchTestConsistency(
    TEST_LUNAR_MONTHS,
    getZuoYouIndex,
    getZuoYouIndexFP,
    'getZuoYouIndex'
  );
};

/**
 * 左辅右弼计算性能测试
 * 对比原版实现和函数式实现的性能
 * 
 * @param iterations 每个测试用例的迭代次数，默认10000次
 */
export const testZuoYouPerformance = (iterations: number = 10000): void => {
  batchTestPerformance(
    TEST_LUNAR_MONTHS,
    getZuoYouIndex,
    getZuoYouIndexFP,
    'getZuoYouIndex',
    iterations
  );
};

/**
 * 快速验证所有月份的左辅右弼位置
 * 用于开发时快速检查计算逻辑是否正确
 */
export const quickVerifyZuoYou = (): void => {
  console.log('[INFO] 左辅右弼位置快速验证:');
  console.log('月份 | 左辅位置 | 右弼位置');
  console.log('-----|---------|--------');
  
  TEST_LUNAR_MONTHS.forEach(month => {
    const result = getZuoYouIndex(month);
    console.log(`${month.toString().padStart(2)}   | ${result.zuoIndex.toString().padStart(7)} | ${result.youIndex.toString().padStart(7)}`);
  });
  
  console.log('\n[DONE] 左辅右弼位置验证完成');
};

/**
 * 验证左辅右弼的对称性
 * 左辅右弼应该在命盘中呈现某种对称关系
 */
export const verifyZuoYouSymmetry = (): void => {
  console.log('[INFO] 验证左辅右弼的对称性:');
  
  TEST_LUNAR_MONTHS.forEach(month => {
    const result = getZuoYouIndex(month);
    const distance = Math.abs(result.zuoIndex - result.youIndex);
    const minDistance = Math.min(distance, 12 - distance);
    
    console.log(`${month}月: 左辅${result.zuoIndex} 右弼${result.youIndex} 距离${minDistance}`);
  });
  
  console.log('\n[DONE] 左辅右弼对称性验证完成');
};

// ==================== 导出 ====================

// 主要导出函数
export { getZuoYouIndex as default };
