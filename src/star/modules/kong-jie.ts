/**
 * 地空地劫星曜位置计算模块
 * 
 * 职责：
 * - 根据时辰计算地空地劫的位置
 * - 提供原版和优化版本的实现
 * - 包含完整的测试和性能验证
 * 
 * 算法说明：
 * - 亥上子时顺安劫：从亥宫顺数到时辰地支索引是地劫的索引
 * - 逆回便是地空亡：从亥宫逆数到时辰地支索引是地空的索引
 * 
 * 由于时辰地支的索引即是时辰的序号，所以可以直接使用时辰的序号
 */

import { fixIndex, fixEarthlyBranchIndex } from '../../utils';
import { 
  normalizeTimeIndex,
  getBasePosition,
  calculateForwardStarIndex,
  calculateReverseStarIndex,
  batchTestConsistency,
  batchTestPerformance
} from '../shared/star-location-utils';
import { EarthlyBranchName } from '../../i18n';

// ==================== 类型定义 ====================

/**
 * 地空地劫位置结果
 */
export interface KongJiePosition {
  /** 地空索引 */
  kongIndex: number;
  /** 地劫索引 */
  jieIndex: number;
}

// ==================== 核心计算函数 ====================

/**
 * 获取地空地劫的索引 - 原版实现
 * 保持与原 location.ts 完全一致的实现
 * 
 * @param timeIndex 时辰索引【0～12】
 * @returns 地空、地劫索引
 */
export const getKongJieIndex = (timeIndex: number): KongJiePosition => {
  const fixedTimeIndex = fixIndex(timeIndex);
  const haiIndex = fixEarthlyBranchIndex('hai');
  const kongIndex = fixIndex(haiIndex - fixedTimeIndex);
  const jieIndex = fixIndex(haiIndex + fixedTimeIndex);

  return { kongIndex, jieIndex };
};

/**
 * 获取地空地劫的索引 - 函数式优化版本
 * 
 * 优势：
 * 1. 使用高阶函数，逻辑更清晰
 * 2. 消除重复计算，提高性能
 * 3. 函数式编程，易于测试和维护
 * 4. 语义更明确，代码可读性更好
 * 
 * @param timeIndex 时辰索引【0～12】
 * @returns 地空、地劫索引
 */
export const getKongJieIndexFP = (timeIndex: number): KongJiePosition => {
  // 步骤1：标准化时辰索引，只计算一次
  const normalizedTimeIndex = normalizeTimeIndex(timeIndex);
  
  // 步骤2：并行计算两个星曜位置，逻辑清晰
  return {
    // 地空：从亥宫逆时针计算
    kongIndex: calculateReverseStarIndex('hai' as EarthlyBranchName)(normalizedTimeIndex),
    // 地劫：从亥宫顺时针计算
    jieIndex: calculateForwardStarIndex('hai' as EarthlyBranchName)(normalizedTimeIndex)
  };
};

// ==================== 测试和验证函数 ====================

/**
 * 测试用例：13个时辰（包括晚子时）
 */
const TEST_TIME_INDICES: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * 时辰名称映射，用于显示
 */
const TIME_NAMES: string[] = [
  '子时', '丑时', '寅时', '卯时', '辰时', '巳时',
  '午时', '未时', '申时', '酉时', '戌时', '亥时', '晚子时'
];

/**
 * 验证地空地劫计算的一致性
 * 对比原版实现和函数式实现的结果
 * 
 * @returns 是否所有测试都通过
 */
export const testKongJieConsistency = (): boolean => {
  return batchTestConsistency(
    TEST_TIME_INDICES,
    getKongJieIndex,
    getKongJieIndexFP,
    'getKongJieIndex'
  );
};

/**
 * 地空地劫计算性能测试
 * 对比原版实现和函数式实现的性能
 * 
 * @param iterations 每个测试用例的迭代次数，默认10000次
 */
export const testKongJiePerformance = (iterations: number = 10000): void => {
  batchTestPerformance(
    TEST_TIME_INDICES,
    getKongJieIndex,
    getKongJieIndexFP,
    'getKongJieIndex',
    iterations
  );
};

/**
 * 快速验证所有时辰的地空地劫位置
 * 用于开发时快速检查计算逻辑是否正确
 */
export const quickVerifyKongJie = (): void => {
  console.log('[INFO] 地空地劫位置快速验证:');
  console.log('时辰   | 地空位置 | 地劫位置');
  console.log('-------|---------|--------');
  
  TEST_TIME_INDICES.forEach(timeIndex => {
    const result = getKongJieIndex(timeIndex);
    const timeName = TIME_NAMES[timeIndex] || `${timeIndex}时`;
    console.log(`${timeName.padEnd(6)} | ${result.kongIndex.toString().padStart(7)} | ${result.jieIndex.toString().padStart(7)}`);
  });
  
  console.log('\n[DONE] 地空地劫位置验证完成');
};

/**
 * 验证地空地劫的对称性
 * 地空地劫应该在命盘中呈现对称关系
 */
export const verifyKongJieSymmetry = (): void => {
  console.log('[INFO] 验证地空地劫的对称性:');
  
  TEST_TIME_INDICES.forEach(timeIndex => {
    const result = getKongJieIndex(timeIndex);
    const timeName = TIME_NAMES[timeIndex] || `${timeIndex}时`;
    const distance = Math.abs(result.kongIndex - result.jieIndex);
    const minDistance = Math.min(distance, 12 - distance);
    
    console.log(`${timeName}: 地空${result.kongIndex} 地劫${result.jieIndex} 距离${minDistance}`);
  });
  
  console.log('\n[DONE] 地空地劫对称性验证完成');
};

/**
 * 验证地空地劫与亥宫的关系
 * 检查计算结果是否符合"亥上子时顺安劫，逆回便是地空亡"的规律
 */
export const verifyKongJieWithHai = (): void => {
  console.log('[INFO] 验证地空地劫与亥宫的关系:');
  
  const haiIndex = getBasePosition('hai');
  console.log(`亥宫位置: ${haiIndex}`);
  console.log('时辰   | 地空计算 | 地劫计算 | 验证结果');
  console.log('-------|---------|---------|--------');
  
  TEST_TIME_INDICES.forEach(timeIndex => {
    const result = getKongJieIndex(timeIndex);
    const timeName = TIME_NAMES[timeIndex] || `${timeIndex}时`;
    
    // 验证计算公式
    const expectedKong = fixIndex(haiIndex - timeIndex);
    const expectedJie = fixIndex(haiIndex + timeIndex);
    
    const kongCorrect = result.kongIndex === expectedKong;
    const jieCorrect = result.jieIndex === expectedJie;
    const allCorrect = kongCorrect && jieCorrect;
    
    console.log(`${timeName.padEnd(6)} | ${result.kongIndex}=${expectedKong}${kongCorrect ? '[PASS]' : '[FAIL]'} | ${result.jieIndex}=${expectedJie}${jieCorrect ? '[PASS]' : '[FAIL]'} | ${allCorrect ? '[PASS]' : '[FAIL]'}`);
  });
  
  console.log('\n[DONE] 地空地劫与亥宫关系验证完成');
};

// ==================== 导出 ====================

// 主要导出函数
export { getKongJieIndex as default };
