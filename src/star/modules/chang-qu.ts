/**
 * 文昌文曲星曜位置计算模块
 * 
 * 职责：
 * - 根据时辰计算文昌文曲的位置（按时支）
 * - 根据天干计算流昌流曲的位置（大限/流年用）
 * - 提供原版和函数式两种实现
 * - 包含完整的测试和性能验证
 * 
 * 算法说明：
 * 按时辰：
 * - 辰上顺时文曲位：从辰宫顺数到时辰地支索引是文曲的索引
 * - 戌上逆时觅文昌：从戌宫逆数到时辰地支索引是文昌的索引
 * 
 * 按天干：
 * - 流昌起巳位，甲乙顺流去，不用四墓宫，日月同年岁
 * - 流曲起酉位，甲乙逆行踪，亦不用四墓，年日月相同
 */

import { fixIndex, fixEarthlyBranchIndex } from '../../utils';
import { HeavenlyStemName, HeavenlyStemKey, EarthlyBranchName } from '../../i18n';
import { 
  normalizeTimeIndex,
  calculateForwardStarIndex,
  calculateReverseStarIndex,
  convertHeavenlyStemToKey,
  lookupFromMapping,
  batchTestConsistency,
  batchTestPerformance
} from '../shared/star-location-utils';

// ==================== 类型定义 ====================

/**
 * 文昌文曲位置结果
 */
export interface ChangQuPosition {
  /** 文昌索引 */
  changIndex: number;
  /** 文曲索引 */
  quIndex: number;
}

// ==================== 按时辰计算的文昌文曲 ====================

/**
 * 获取文昌文曲的索引 - 原版实现（按时支）
 * 保持与原 location.ts 完全一致的实现
 * 
 * @param timeIndex 时辰索引【0～12】
 * @returns 文昌、文曲索引
 */
export const getChangQuIndex = (timeIndex: number): ChangQuPosition => {
  const changIndex = fixIndex(fixEarthlyBranchIndex('xu') - fixIndex(timeIndex));
  const quIndex = fixIndex(fixEarthlyBranchIndex('chen') + fixIndex(timeIndex));

  return { changIndex, quIndex };
};

/**
 * 获取文昌文曲的索引 - 函数式版本（按时支）
 * 
 * 优势：
 * 1. 消除重复计算：normalizeTimeIndex 只计算一次
 * 2. 提高可读性：函数名清晰表达业务意图
 * 3. 增强可测试性：每个步骤都可以单独测试
 * 4. 提升可复用性：小函数可以在其他地方使用
 * 5. 降低维护成本：修改某个步骤不影响其他部分
 * 
 * @param timeIndex 时辰索引【0～12】
 * @returns 文昌、文曲索引
 */
export const getChangQuIndexFP = (timeIndex: number): ChangQuPosition => {
  // Step 1: 标准化输入，避免重复计算
  const normalizedTimeIndex = normalizeTimeIndex(timeIndex);
  
  // Step 2: 并行计算两个星曜位置，逻辑清晰
  return {
    // 文昌：从戌宫逆时针计算
    changIndex: calculateReverseStarIndex('xu' as EarthlyBranchName)(normalizedTimeIndex),
    // 文曲：从辰宫顺时针计算  
    quIndex: calculateForwardStarIndex('chen' as EarthlyBranchName)(normalizedTimeIndex)
  };
};

// ==================== 按天干计算的流昌流曲 ====================

/**
 * 天干到流昌流曲位置的映射表
 * 
 * 规律：
 * - 甲：文昌在巳，文曲在酉
 * - 乙：文昌在午，文曲在申
 * - 丙戊：文昌在申，文曲在午
 * - 丁己：文昌在酉，文曲在巳
 * - 庚：文昌在亥，文曲在卯
 * - 辛：文昌在子，文曲在寅
 * - 壬：文昌在寅，文曲在子
 * - 癸：文昌在卯，文曲在亥
 */
const HEAVENLY_STEM_TO_CHANG_QU: Record<HeavenlyStemKey, {chang: EarthlyBranchName, qu: EarthlyBranchName}> = {
  // 甲：文昌在巳，文曲在酉
  jiaHeavenly: { chang: 'si', qu: 'you' },
  
  // 乙：文昌在午，文曲在申
  yiHeavenly: { chang: 'woo', qu: 'shen' },
  
  // 丙戊：文昌在申，文曲在午
  bingHeavenly: { chang: 'shen', qu: 'woo' },
  wuHeavenly: { chang: 'shen', qu: 'woo' },
  
  // 丁己：文昌在酉，文曲在巳
  dingHeavenly: { chang: 'you', qu: 'si' },
  jiHeavenly: { chang: 'you', qu: 'si' },
  
  // 庚：文昌在亥，文曲在卯
  gengHeavenly: { chang: 'hai', qu: 'mao' },
  
  // 辛：文昌在子，文曲在寅
  xinHeavenly: { chang: 'zi', qu: 'yin' },
  
  // 壬：文昌在寅，文曲在子
  renHeavenly: { chang: 'yin', qu: 'zi' },
  
  // 癸：文昌在卯，文曲在亥
  guiHeavenly: { chang: 'mao', qu: 'hai' }
};

/**
 * 通过天干获取流昌流曲 - 函数式版本
 * 用于大限/流年的文昌文曲计算
 * 
 * @param heavenlyStemName 天干名称
 * @returns 文昌、文曲索引
 */
export const getChangQuIndexByHeavenlyStem = (heavenlyStemName: HeavenlyStemName): ChangQuPosition => {
  // 步骤1：转换为内部键值
  const heavenlyStem = convertHeavenlyStemToKey(heavenlyStemName);
  
  // 步骤2：查找文昌文曲位置
  const positions = lookupFromMapping(HEAVENLY_STEM_TO_CHANG_QU, heavenlyStem);
  
  // 步骤3：计算最终索引
  const changIndex = fixIndex(fixEarthlyBranchIndex(positions.chang));
  const quIndex = fixIndex(fixEarthlyBranchIndex(positions.qu));
  
  return { changIndex, quIndex };
};

/**
 * 通过天干获取流昌流曲 - 函数式版本（别名）
 * 保持与原 location.ts 中函数名的一致性
 */
export const getChangQuIndexByHeavenlyStemFP = getChangQuIndexByHeavenlyStem;

// ==================== 测试和验证函数 ====================

/**
 * 测试用例：13个时辰（包括晚子时）
 */
const TEST_TIME_INDICES: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * 测试用例：10个天干
 */
const TEST_HEAVENLY_STEMS: HeavenlyStemName[] = [
  '甲', '乙', '丙', '丁', '戊',
  '己', '庚', '辛', '壬', '癸'
];

/**
 * 时辰名称映射，用于显示
 */
const TIME_NAMES: string[] = [
  '子时', '丑时', '寅时', '卯时', '辰时', '巳时',
  '午时', '未时', '申时', '酉时', '戌时', '亥时', '晚子时'
];

/**
 * 验证文昌文曲计算的一致性（按时辰）
 * 对比原版实现和函数式实现的结果
 * 
 * @returns 是否所有测试都通过
 */
export const testChangQuConsistency = (): boolean => {
  return batchTestConsistency(
    TEST_TIME_INDICES,
    getChangQuIndex,
    getChangQuIndexFP,
    'getChangQuIndex'
  );
};

/**
 * 验证流昌流曲计算的一致性（按天干）
 * 
 * @returns 是否所有测试都通过
 */
export const testChangQuByHeavenlyStemConsistency = (): boolean => {
  return batchTestConsistency(
    TEST_HEAVENLY_STEMS,
    getChangQuIndexByHeavenlyStem,
    getChangQuIndexByHeavenlyStemFP,
    'getChangQuIndexByHeavenlyStem'
  );
};

/**
 * 文昌文曲计算性能测试（按时辰）
 * 
 * @param iterations 每个测试用例的迭代次数，默认10000次
 */
export const testChangQuPerformance = (iterations: number = 10000): void => {
  batchTestPerformance(
    TEST_TIME_INDICES,
    getChangQuIndex,
    getChangQuIndexFP,
    'getChangQuIndex',
    iterations
  );
};

/**
 * 流昌流曲计算性能测试（按天干）
 * 
 * @param iterations 每个测试用例的迭代次数，默认10000次
 */
export const testChangQuByHeavenlyStemPerformance = (iterations: number = 10000): void => {
  batchTestPerformance(
    TEST_HEAVENLY_STEMS,
    getChangQuIndexByHeavenlyStem,
    getChangQuIndexByHeavenlyStemFP,
    'getChangQuIndexByHeavenlyStem',
    iterations
  );
};

/**
 * 快速验证所有时辰的文昌文曲位置
 * 用于开发时快速检查计算逻辑是否正确
 */
export const quickVerifyChangQu = (): void => {
  console.log('[INFO] 文昌文曲位置快速验证（按时辰）:');
  console.log('时辰   | 文昌位置 | 文曲位置');
  console.log('-------|---------|--------');
  
  TEST_TIME_INDICES.forEach(timeIndex => {
    const result = getChangQuIndex(timeIndex);
    const timeName = TIME_NAMES[timeIndex] || `${timeIndex}时`;
    console.log(`${timeName.padEnd(6)} | ${result.changIndex.toString().padStart(7)} | ${result.quIndex.toString().padStart(7)}`);
  });
  
  console.log('\n[DONE] 文昌文曲位置验证完成');
};

/**
 * 快速验证所有天干的流昌流曲位置
 * 用于开发时快速检查映射表是否正确
 */
export const quickVerifyChangQuByHeavenlyStem = (): void => {
  console.log('[INFO] 流昌流曲位置快速验证（按天干）:');
  console.log('天干 | 文昌位置 | 文曲位置');
  console.log('-----|---------|--------');
  
  TEST_HEAVENLY_STEMS.forEach(stem => {
    const result = getChangQuIndexByHeavenlyStem(stem);
    console.log(`${stem}   | ${result.changIndex.toString().padStart(7)} | ${result.quIndex.toString().padStart(7)}`);
  });
  
  console.log('\n[DONE] 流昌流曲位置验证完成');
};

/**
 * 验证文昌文曲的对称性（按时辰）
 * 文昌文曲应该在命盘中呈现某种对称关系
 */
export const verifyChangQuSymmetry = (): void => {
  console.log('[INFO] 验证文昌文曲的对称性:');
  
  TEST_TIME_INDICES.forEach(timeIndex => {
    const result = getChangQuIndex(timeIndex);
    const timeName = TIME_NAMES[timeIndex] || `${timeIndex}时`;
    const distance = Math.abs(result.changIndex - result.quIndex);
    const minDistance = Math.min(distance, 12 - distance);
    
    console.log(`${timeName}: 文昌${result.changIndex} 文曲${result.quIndex} 距离${minDistance}`);
  });
  
  console.log('\n[DONE] 文昌文曲对称性验证完成');
};

/**
 * 验证文昌文曲与辰戌轴的关系
 * 检查计算结果是否符合"辰上顺时文曲位，戌上逆时觅文昌"的规律
 */
export const verifyChangQuWithChenXu = (): void => {
  console.log('[INFO] 验证文昌文曲与辰戌轴的关系:');
  
  const chenIndex = fixEarthlyBranchIndex('chen');
  const xuIndex = fixEarthlyBranchIndex('xu');
  console.log(`辰宫位置: ${chenIndex}, 戌宫位置: ${xuIndex}`);
  console.log('时辰   | 文昌计算 | 文曲计算 | 验证结果');
  console.log('-------|---------|---------|--------');
  
  TEST_TIME_INDICES.forEach(timeIndex => {
    const result = getChangQuIndex(timeIndex);
    const timeName = TIME_NAMES[timeIndex] || `${timeIndex}时`;
    
    // 验证计算公式
    const expectedChang = fixIndex(xuIndex - timeIndex);
    const expectedQu = fixIndex(chenIndex + timeIndex);
    
    const changCorrect = result.changIndex === expectedChang;
    const quCorrect = result.quIndex === expectedQu;
    const allCorrect = changCorrect && quCorrect;
    
    console.log(`${timeName.padEnd(6)} | ${result.changIndex}=${expectedChang}${changCorrect ? '[PASS]' : '[FAIL]'} | ${result.quIndex}=${expectedQu}${quCorrect ? '[PASS]' : '[FAIL]'} | ${allCorrect ? '[PASS]' : '[FAIL]'}`);
  });
  
  console.log('\n[DONE] 文昌文曲与辰戌轴关系验证完成');
};

// ==================== 导出 ====================

// 主要导出函数
export { getChangQuIndex as default };
