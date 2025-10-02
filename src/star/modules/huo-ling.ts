/**
 * 火星铃星星曜位置计算模块
 * 
 * 职责：
 * - 根据地支和时辰计算火星铃星的位置
 * - 基于地支三合局的映射关系
 * - 提供函数式实现和完整验证
 * 
 * 算法说明：
 * 火星铃星按地支三合局分组，每组有不同的起始位置：
 * - 寅午戌组：火星从丑开始，铃星从卯开始
 * - 申子辰组：火星从寅开始，铃星从戌开始
 * - 巳酉丑组：火星从卯开始，铃星从戌开始
 * - 亥卯未组：火星从酉开始，铃星从戌开始
 * 
 * 然后根据时辰索引进行偏移计算
 */

import { fixIndex, fixEarthlyBranchIndex } from '../../utils';
import { EarthlyBranchName, EarthlyBranchKey } from '../../i18n';
import { 
  normalizeTimeIndex,
  convertEarthlyBranchToKey,
  lookupFromMapping,
  batchTestConsistency,
  batchTestPerformance
} from '../shared/star-location-utils';

// ==================== 类型定义 ====================

/**
 * 火星铃星位置结果
 */
export interface HuoLingPosition {
  /** 火星索引 */
  huoIndex: number;
  /** 铃星索引 */
  lingIndex: number;
}

/**
 * 火星铃星起始位置配置
 */
interface HuoLingBasePosition {
  /** 火星起始位置 */
  huoBase: number;
  /** 铃星起始位置 */
  lingBase: number;
}

// ==================== 映射表 ====================

/**
 * 地支组到火星铃星起始位置的映射表
 * 
 * 基于地支三合局的分组规律：
 * - 寅午戌组（火局）：火星从丑开始，铃星从卯开始
 * - 申子辰组（水局）：火星从寅开始，铃星从戌开始
 * - 巳酉丑组（金局）：火星从卯开始，铃星从戌开始
 * - 亥卯未组（木局）：火星从酉开始，铃星从戌开始
 */
const EARTHLY_BRANCH_TO_HUO_LING_BASE: Record<EarthlyBranchKey, HuoLingBasePosition> = {
  // 寅午戌组：火星从丑开始，铃星从卯开始
  yinEarthly: { huoBase: fixEarthlyBranchIndex('chou'), lingBase: fixEarthlyBranchIndex('mao') },
  wuEarthly: { huoBase: fixEarthlyBranchIndex('chou'), lingBase: fixEarthlyBranchIndex('mao') },
  xuEarthly: { huoBase: fixEarthlyBranchIndex('chou'), lingBase: fixEarthlyBranchIndex('mao') },
  
  // 申子辰组：火星从寅开始，铃星从戌开始
  shenEarthly: { huoBase: fixEarthlyBranchIndex('yin'), lingBase: fixEarthlyBranchIndex('xu') },
  ziEarthly: { huoBase: fixEarthlyBranchIndex('yin'), lingBase: fixEarthlyBranchIndex('xu') },
  chenEarthly: { huoBase: fixEarthlyBranchIndex('yin'), lingBase: fixEarthlyBranchIndex('xu') },
  
  // 巳酉丑组：火星从卯开始，铃星从戌开始
  siEarthly: { huoBase: fixEarthlyBranchIndex('mao'), lingBase: fixEarthlyBranchIndex('xu') },
  youEarthly: { huoBase: fixEarthlyBranchIndex('mao'), lingBase: fixEarthlyBranchIndex('xu') },
  chouEarthly: { huoBase: fixEarthlyBranchIndex('mao'), lingBase: fixEarthlyBranchIndex('xu') },
  
  // 亥卯未组：火星从酉开始，铃星从戌开始
  haiEarthly: { huoBase: fixEarthlyBranchIndex('you'), lingBase: fixEarthlyBranchIndex('xu') },
  maoEarthly: { huoBase: fixEarthlyBranchIndex('you'), lingBase: fixEarthlyBranchIndex('xu') },
  weiEarthly: { huoBase: fixEarthlyBranchIndex('you'), lingBase: fixEarthlyBranchIndex('xu') }
};

// ==================== 核心计算函数 ====================

/**
 * 获取火星铃星位置索引 - 函数式版本
 * 
 * 优势：
 * 1. 使用映射表，逻辑清晰
 * 2. 函数式编程，易于测试
 * 3. 性能优化，避免重复计算
 * 4. 基于地支三合局的科学分组
 * 
 * @param earthlyBranchName 地支名称
 * @param timeIndex 时辰索引【0～12】
 * @returns 火星、铃星索引
 */
export const getHuoLingIndex = (earthlyBranchName: EarthlyBranchName, timeIndex: number): HuoLingPosition => {
  // 步骤1：转换为内部键值和标准化时辰
  const earthlyBranch = convertEarthlyBranchToKey(earthlyBranchName);
  const fixedTimeIndex = normalizeTimeIndex(timeIndex);
  
  // 步骤2：查找起始位置
  const basePositions = lookupFromMapping(EARTHLY_BRANCH_TO_HUO_LING_BASE, earthlyBranch);
  
  // 步骤3：计算最终索引（起始位置 + 时辰偏移）
  const huoIndex = fixIndex(basePositions.huoBase + fixedTimeIndex);
  const lingIndex = fixIndex(basePositions.lingBase + fixedTimeIndex);
  
  return { huoIndex, lingIndex };
};

/**
 * 获取火星铃星位置索引 - 函数式版本（别名）
 * 保持与原 location.ts 中函数名的一致性
 */
export const getHuoLingIndexFP = getHuoLingIndex;

// ==================== 测试和验证函数 ====================

/**
 * 测试用例：12个地支
 */
const TEST_EARTHLY_BRANCHES: EarthlyBranchName[] = [
  '寅', '卯', '辰', '巳', '午', '未', 
  '申', '酉', '戌', '亥', '子', '丑'
];

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
 * 验证火星铃星计算的一致性
 * 
 * @returns 是否所有测试都通过
 */
export const testHuoLingConsistency = (): boolean => {
  console.log('[INFO] 开始验证火星铃星计算一致性...');
  
  let allConsistent = true;
  let testCount = 0;
  
  // 测试所有地支和时辰的组合
  TEST_EARTHLY_BRANCHES.forEach(branch => {
    TEST_TIME_INDICES.slice(0, 3).forEach(timeIndex => { // 只测试前3个时辰以节省时间
      const result1 = getHuoLingIndex(branch, timeIndex);
      const result2 = getHuoLingIndexFP(branch, timeIndex);
      
      const isConsistent = JSON.stringify(result1) === JSON.stringify(result2);
      allConsistent = allConsistent && isConsistent;
      testCount++;
      
      if (!isConsistent) {
        console.log(`[FAIL] ${branch}支${TIME_NAMES[timeIndex]}: 结果不一致`);
        console.log(`  版本1: ${JSON.stringify(result1)}`);
        console.log(`  版本2: ${JSON.stringify(result2)}`);
      }
    });
  });
  
  console.log(`[RESULT] 总体结果: ${allConsistent ? '[PASS] 完全一致' : '[FAIL] 存在差异'} (测试${testCount}个组合)`);
  return allConsistent;
};

/**
 * 火星铃星计算性能测试
 * 
 * @param iterations 每个测试用例的迭代次数，默认10000次
 */
export const testHuoLingPerformance = (iterations: number = 10000): void => {
  console.log(`[INFO] 开始火星铃星性能测试 (${iterations}次迭代)...`);
  
  const testBranch = '寅';
  const testTime = 6;
  
  // 性能测试
  const startTime = performance.now();
  for (let i = 0; i < iterations; i++) {
    getHuoLingIndex(testBranch, testTime);
  }
  const endTime = performance.now();
  
  const duration = endTime - startTime;
  console.log(`[TIME] 耗时: ${duration.toFixed(2)}ms`);
  console.log(`[PERF] 平均每次: ${(duration / iterations).toFixed(4)}ms`);
  console.log(`[PERF] 每秒可执行: ${Math.round(iterations / (duration / 1000))} 次`);
  
  console.log('\n[DONE] 火星铃星性能测试完成！');
};

/**
 * 快速验证火星铃星的三合局分组
 * 用于开发时快速检查映射表是否正确
 */
export const quickVerifyHuoLingGroups = (): void => {
  console.log('[INFO] 火星铃星三合局分组验证:');
  
  const groups = [
    { name: '寅午戌组(火局)', branches: ['寅', '午', '戌'] },
    { name: '申子辰组(水局)', branches: ['申', '子', '辰'] },
    { name: '巳酉丑组(金局)', branches: ['巳', '酉', '丑'] },
    { name: '亥卯未组(木局)', branches: ['亥', '卯', '未'] }
  ];
  
  groups.forEach(group => {
    console.log(`\n${group.name}:`);
    console.log('地支 | 火星起始 | 铃星起始');
    console.log('-----|---------|--------');
    
    group.branches.forEach(branch => {
      const earthlyBranch = convertEarthlyBranchToKey(branch as EarthlyBranchName);
      const basePositions = lookupFromMapping(EARTHLY_BRANCH_TO_HUO_LING_BASE, earthlyBranch);
      console.log(`${branch}   |    ${basePositions.huoBase}    |    ${basePositions.lingBase}`);
    });
  });
  
  console.log('\n[DONE] 三合局分组验证完成');
};

/**
 * 验证火星铃星在不同时辰的位置变化
 * 展示时辰偏移对星曜位置的影响
 */
export const verifyHuoLingTimeOffset = (): void => {
  console.log('[INFO] 验证火星铃星时辰偏移:');
  
  const testBranch = '寅'; // 使用寅支作为测试
  console.log(`测试地支: ${testBranch}支 (寅午戌火局组)`);
  console.log('时辰   | 火星位置 | 铃星位置');
  console.log('-------|---------|--------');
  
  TEST_TIME_INDICES.forEach(timeIndex => {
    const result = getHuoLingIndex(testBranch, timeIndex);
    const timeName = TIME_NAMES[timeIndex] || `${timeIndex}时`;
    console.log(`${timeName.padEnd(6)} | ${result.huoIndex.toString().padStart(7)} | ${result.lingIndex.toString().padStart(7)}`);
  });
  
  console.log('\n[DONE] 时辰偏移验证完成');
};

/**
 * 验证火星铃星的分布规律
 * 检查不同地支组的火星铃星分布是否符合预期
 */
export const verifyHuoLingDistribution = (): void => {
  console.log('[INFO] 验证火星铃星分布规律:');
  
  const testTime = 0; // 使用子时作为基准
  console.log(`测试时辰: 子时 (索引${testTime})`);
  console.log('地支 | 三合局 | 火星位置 | 铃星位置');
  console.log('-----|-------|---------|--------');
  
  const groupMap: Record<string, string> = {
    '寅': '火局', '午': '火局', '戌': '火局',
    '申': '水局', '子': '水局', '辰': '水局',
    '巳': '金局', '酉': '金局', '丑': '金局',
    '亥': '木局', '卯': '木局', '未': '木局'
  };
  
  TEST_EARTHLY_BRANCHES.forEach(branch => {
    const result = getHuoLingIndex(branch, testTime);
    const group = groupMap[branch] || '未知';
    console.log(`${branch}   | ${group} | ${result.huoIndex.toString().padStart(7)} | ${result.lingIndex.toString().padStart(7)}`);
  });
  
  console.log('\n[DONE] 分布规律验证完成');
};

// ==================== 导出 ====================

// 主要导出函数
export { getHuoLingIndex as default };
