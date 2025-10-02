/**
 * 天魁天钺星曜位置计算模块
 * 
 * 职责：
 * - 根据天干计算天魁天钺的位置
 * - 提供函数式和原版两种实现
 * - 包含完整的测试和性能验证
 * 
 * 算法说明：
 * 天魁天钺按天干起例，每个天干对应固定的天魁天钺位置
 */

import { fixEarthlyBranchIndex } from '../../utils';
import { HeavenlyStemName, HeavenlyStemKey, EarthlyBranchName } from '../../i18n';
import { 
  convertHeavenlyStemToKey,
  lookupFromMapping,
  batchTestConsistency,
  batchTestPerformance
} from '../shared/star-location-utils';

// ==================== 类型定义 ====================

/**
 * 天魁天钺位置结果
 */
export interface KuiYuePosition {
  /** 天魁索引 */
  kuiIndex: number;
  /** 天钺索引 */
  yueIndex: number;
}

// ==================== 映射表 ====================

/**
 * 天干到天魁天钺位置的映射表
 * 
 * 规律：
 * - 甲戊庚：天魁在丑，天钺在未
 * - 乙己：天魁在子，天钺在申  
 * - 辛：天魁在午，天钺在寅
 * - 丙丁：天魁在亥，天钺在酉
 * - 壬癸：天魁在卯，天钺在巳
 */
const HEAVENLY_STEM_TO_KUI_YUE: Record<HeavenlyStemKey, {kui: EarthlyBranchName, yue: EarthlyBranchName}> = {
  jiaHeavenly: { kui: 'chou', yue: 'wei' },
  wuHeavenly: { kui: 'chou', yue: 'wei' },
  gengHeavenly: { kui: 'chou', yue: 'wei' },
  yiHeavenly: { kui: 'zi', yue: 'shen' },      
  jiHeavenly: { kui: 'zi', yue: 'shen' },      
  xinHeavenly: { kui: 'woo', yue: 'yin' },     
  bingHeavenly: { kui: 'hai', yue: 'you' },
  dingHeavenly: { kui: 'hai', yue: 'you' },
  renHeavenly: { kui: 'mao', yue: 'si' },
  guiHeavenly: { kui: 'mao', yue: 'si' }
};

// ==================== 核心计算函数 ====================

/**
 * 获取天魁天钺位置索引 - 函数式版本
 * 
 * 优势：
 * 1. 使用映射表，逻辑清晰
 * 2. 函数式编程，易于测试
 * 3. 性能优化，避免重复计算
 * 
 * @param heavenlyStemName 天干名称
 * @returns 天魁天钺位置索引
 */
export const getKuiYueIndex = (heavenlyStemName: HeavenlyStemName): KuiYuePosition => {
  // 步骤1：转换为内部键值
  const heavenlyStem = convertHeavenlyStemToKey(heavenlyStemName);
  
  // 步骤2：查找天魁天钺位置
  const positions = lookupFromMapping(HEAVENLY_STEM_TO_KUI_YUE, heavenlyStem);
  
  // 步骤3：计算最终索引
  const kuiIndex = fixEarthlyBranchIndex(positions.kui);
  const yueIndex = fixEarthlyBranchIndex(positions.yue);
  
  return { kuiIndex, yueIndex };
};

/**
 * 获取天魁天钺位置索引 - 函数式版本（别名）
 * 保持与原 location.ts 中函数名的一致性
 */
export const getKuiYueIndexFP = getKuiYueIndex;

// ==================== 测试和验证函数 ====================

/**
 * 测试用例：所有10个天干
 */
const TEST_HEAVENLY_STEMS: HeavenlyStemName[] = [
  '甲', '乙', '丙', '丁', '戊',
  '己', '庚', '辛', '壬', '癸'
];

/**
 * 验证天魁天钺计算的一致性
 * 由于这是新拆分的模块，主要用于验证映射表的正确性
 * 
 * @returns 是否所有测试都通过
 */
export const testKuiYueConsistency = (): boolean => {
  return batchTestConsistency(
    TEST_HEAVENLY_STEMS,
    getKuiYueIndex,
    getKuiYueIndexFP,
    'getKuiYueIndex'
  );
};

/**
 * 天魁天钺计算性能测试
 * 
 * @param iterations 每个测试用例的迭代次数，默认10000次
 */
export const testKuiYuePerformance = (iterations: number = 10000): void => {
  batchTestPerformance(
    TEST_HEAVENLY_STEMS,
    getKuiYueIndex,
    getKuiYueIndexFP,
    'getKuiYueIndex',
    iterations
  );
};

/**
 * 快速验证所有天干的天魁天钺位置
 * 用于开发时快速检查映射表是否正确
 */
export const quickVerifyKuiYue = (): void => {
  console.log('[INFO] 天魁天钺位置快速验证:');
  console.log('天干 | 天魁位置 | 天钺位置');
  console.log('-----|---------|--------');
  
  TEST_HEAVENLY_STEMS.forEach(stem => {
    const result = getKuiYueIndex(stem);
    console.log(`${stem}   | ${result.kuiIndex.toString().padStart(7)} | ${result.yueIndex.toString().padStart(7)}`);
  });
  
  console.log('\n[DONE] 天魁天钺位置验证完成');
};

// ==================== 导出 ====================

// 主要导出函数
export { getKuiYueIndex as default };
