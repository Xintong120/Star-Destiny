/**
 * 桃花星模块 - 红鸾天喜、华盖咸池星曜位置计算
 * 
 * 职责：
 * - 根据年支计算红鸾天喜的位置
 * - 根据年支计算华盖咸池的位置
 * - 基于地支三合局的映射关系
 * - 提供函数式实现和完整验证
 * 
 * 算法说明：
 * 红鸾天喜：
 * - 卯上起子逆数之，数到当生太岁支，坐守此宫红鸾位，对宫天喜不差移
 * 
 * 华盖咸池：
 * - 华盖：子辰申年在辰，丑巳酉年在丑，寅午戍年在戍，卯未亥年在未
 * - 咸池：子辰申年在酉，丑巳酉年在午，寅午戍年在卯，卯未亥年在子
 */

import { fixIndex, fixEarthlyBranchIndex } from '../../utils';
import { EarthlyBranchName, EarthlyBranchKey } from '../../i18n';
import { EARTHLY_BRANCHES } from '../../data';
import { 
  convertEarthlyBranchToKey,
  lookupFromMapping,
  batchTestConsistency,
  batchTestPerformance
} from '../shared/star-location-utils';

// ==================== 类型定义 ====================

/**
 * 红鸾天喜位置结果
 */
export interface LuanXiPosition {
  /** 红鸾索引 */
  hongluanIndex: number;
  /** 天喜索引 */
  tianxiIndex: number;
}

/**
 * 华盖咸池位置结果
 */
export interface HuagaiXianchiPosition {
  /** 华盖索引 */
  huagaiIndex: number;
  /** 咸池索引 */
  xianchiIndex: number;
}

/**
 * 华盖咸池位置配置
 */
interface HuagaiXianchiConfig {
  /** 华盖位置 */
  huagai: EarthlyBranchName;
  /** 咸池位置 */
  xianchi: EarthlyBranchName;
}

// ==================== 红鸾天喜计算 ====================

/**
 * 获取红鸾天喜所在宫位索引
 * 
 * 算法：卯上起子逆数之，数到当生太岁支，坐守此宫红鸾位，对宫天喜不差移
 * 
 * @param earthlyBranchName 年支
 * @returns 红鸾、天喜索引
 */
export const getLuanXiIndex = (earthlyBranchName: EarthlyBranchName): LuanXiPosition => {
  const earthlyBranch = convertEarthlyBranchToKey(earthlyBranchName);
  const hongluanIndex = fixIndex(fixEarthlyBranchIndex('mao') - EARTHLY_BRANCHES.indexOf(earthlyBranch));
  const tianxiIndex = fixIndex(hongluanIndex + 6);

  return { hongluanIndex, tianxiIndex };
};

// ==================== 华盖咸池计算 ====================

/**
 * 地支组到华盖咸池位置的映射表
 * 
 * 基于地支三合局的分组规律：
 * - 子辰申组（水局）：华盖在辰，咸池在酉
 * - 丑巳酉组（金局）：华盖在丑，咸池在午
 * - 寅午戌组（火局）：华盖在戌，咸池在卯
 * - 卯未亥组（木局）：华盖在未，咸池在子
 */
const EARTHLY_BRANCH_TO_HUAGAI_XIANCHI: Record<EarthlyBranchKey, HuagaiXianchiConfig> = {
  // 寅午戌组：华盖在戌，咸池在卯
  yinEarthly: { huagai: 'xu', xianchi: 'mao' },
  wuEarthly: { huagai: 'xu', xianchi: 'mao' },
  xuEarthly: { huagai: 'xu', xianchi: 'mao' },
  
  // 申子辰组：华盖在辰，咸池在酉
  shenEarthly: { huagai: 'chen', xianchi: 'you' },
  ziEarthly: { huagai: 'chen', xianchi: 'you' },
  chenEarthly: { huagai: 'chen', xianchi: 'you' },
  
  // 巳酉丑组：华盖在丑，咸池在午
  siEarthly: { huagai: 'chou', xianchi: 'woo' },
  youEarthly: { huagai: 'chou', xianchi: 'woo' },
  chouEarthly: { huagai: 'chou', xianchi: 'woo' },
  
  // 亥卯未组：华盖在未，咸池在子
  haiEarthly: { huagai: 'wei', xianchi: 'zi' },
  maoEarthly: { huagai: 'wei', xianchi: 'zi' },
  weiEarthly: { huagai: 'wei', xianchi: 'zi' }
};

/**
 * 获取华盖咸池位置索引 - 函数式版本
 * 
 * @param earthlyBranchName 地支名称
 * @returns 华盖、咸池索引
 */
export const getHuagaiXianchiIndex = (earthlyBranchName: EarthlyBranchName): HuagaiXianchiPosition => {
  // 步骤1：转换为内部键值
  const earthlyBranch = convertEarthlyBranchToKey(earthlyBranchName);
  
  // 步骤2：查找华盖咸池位置
  const positions = lookupFromMapping(EARTHLY_BRANCH_TO_HUAGAI_XIANCHI, earthlyBranch);
  
  // 步骤3：计算最终索引
  const huagaiIndex = fixIndex(fixEarthlyBranchIndex(positions.huagai));
  const xianchiIndex = fixIndex(fixEarthlyBranchIndex(positions.xianchi));
  
  return { huagaiIndex, xianchiIndex };
};

/**
 * 获取华盖咸池位置索引 - 函数式版本（别名）
 * 保持与原 location.ts 中函数名的一致性
 */
export const getHuagaiXianchiIndexFP = getHuagaiXianchiIndex;

// ==================== 测试和验证函数 ====================

/**
 * 测试用例：12个地支
 */
const TEST_EARTHLY_BRANCHES: EarthlyBranchName[] = [
  '寅', '卯', '辰', '巳', '午', '未', 
  '申', '酉', '戌', '亥', '子', '丑'
];

/**
 * 验证红鸾天喜计算的一致性
 * 
 * @returns 是否所有测试都通过
 */
export const testLuanXiConsistency = (): boolean => {
  console.log('[INFO] 开始验证红鸾天喜计算一致性...');
  
  let allConsistent = true;
  
  TEST_EARTHLY_BRANCHES.forEach((branch, index) => {
    const result = getLuanXiIndex(branch);
    
    // 验证天喜是否在红鸾对宫（相差6个位置）
    const expectedTianxi = fixIndex(result.hongluanIndex + 6);
    const isCorrect = result.tianxiIndex === expectedTianxi;
    
    console.log(`${index + 1}. ${branch}支: 红鸾${result.hongluanIndex} 天喜${result.tianxiIndex} ${isCorrect ? '[PASS]' : '[FAIL]'}`);
    
    if (!isCorrect) {
      console.log(`   预期天喜: ${expectedTianxi}, 实际天喜: ${result.tianxiIndex}`);
      allConsistent = false;
    }
  });
  
  console.log(`\n[RESULT] 总体结果: ${allConsistent ? '[PASS] 完全一致' : '[FAIL] 存在差异'}`);
  return allConsistent;
};

/**
 * 验证华盖咸池计算的一致性
 * 
 * @returns 是否所有测试都通过
 */
export const testHuagaiXianchiConsistency = (): boolean => {
  return batchTestConsistency(
    TEST_EARTHLY_BRANCHES,
    getHuagaiXianchiIndex,
    getHuagaiXianchiIndexFP,
    'getHuagaiXianchiIndex'
  );
};

/**
 * 红鸾天喜计算性能测试
 * 
 * @param iterations 每个测试用例的迭代次数，默认10000次
 */
export const testLuanXiPerformance = (iterations: number = 10000): void => {
  console.log(`[INFO] 开始红鸾天喜性能测试 (${iterations}次迭代)...`);
  
  const testBranch = '寅';
  
  const startTime = performance.now();
  for (let i = 0; i < iterations; i++) {
    getLuanXiIndex(testBranch);
  }
  const endTime = performance.now();
  
  const duration = endTime - startTime;
  console.log(`[TIME] 耗时: ${duration.toFixed(2)}ms`);
  console.log(`[PERF] 平均每次: ${(duration / iterations).toFixed(4)}ms`);
  console.log(`[PERF] 每秒可执行: ${Math.round(iterations / (duration / 1000))} 次`);
  
  console.log('\n[DONE] 红鸾天喜性能测试完成！');
};

/**
 * 华盖咸池计算性能测试
 * 
 * @param iterations 每个测试用例的迭代次数，默认10000次
 */
export const testHuagaiXianchiPerformance = (iterations: number = 10000): void => {
  batchTestPerformance(
    TEST_EARTHLY_BRANCHES,
    getHuagaiXianchiIndex,
    getHuagaiXianchiIndexFP,
    'getHuagaiXianchiIndex',
    iterations
  );
};

/**
 * 快速验证红鸾天喜的位置
 * 用于开发时快速检查计算逻辑是否正确
 */
export const quickVerifyLuanXi = (): void => {
  console.log('[INFO] 红鸾天喜位置快速验证:');
  console.log('年支 | 红鸾位置 | 天喜位置 | 距离');
  console.log('-----|---------|---------|-----');
  
  TEST_EARTHLY_BRANCHES.forEach(branch => {
    const result = getLuanXiIndex(branch);
    const distance = Math.abs(result.hongluanIndex - result.tianxiIndex);
    const minDistance = Math.min(distance, 12 - distance);
    
    console.log(`${branch}   | ${result.hongluanIndex.toString().padStart(7)} | ${result.tianxiIndex.toString().padStart(7)} |  ${minDistance}`);
  });
  
  console.log('\n[DONE] 红鸾天喜位置验证完成');
};

/**
 * 快速验证华盖咸池的三合局分组
 * 用于开发时快速检查映射表是否正确
 */
export const quickVerifyHuagaiXianchiGroups = (): void => {
  console.log('[INFO] 华盖咸池三合局分组验证:');
  
  const groups = [
    { name: '寅午戌组(火局)', branches: ['寅', '午', '戌'] },
    { name: '申子辰组(水局)', branches: ['申', '子', '辰'] },
    { name: '巳酉丑组(金局)', branches: ['巳', '酉', '丑'] },
    { name: '亥卯未组(木局)', branches: ['亥', '卯', '未'] }
  ];
  
  groups.forEach(group => {
    console.log(`\n${group.name}:`);
    console.log('地支 | 华盖位置 | 咸池位置');
    console.log('-----|---------|--------');
    
    group.branches.forEach(branch => {
      const result = getHuagaiXianchiIndex(branch as EarthlyBranchName);
      console.log(`${branch}   | ${result.huagaiIndex.toString().padStart(7)} | ${result.xianchiIndex.toString().padStart(7)}`);
    });
  });
  
  console.log('\n[DONE] 三合局分组验证完成');
};

/**
 * 验证红鸾天喜的对宫关系
 * 检查天喜是否始终在红鸾的对宫（相差6个位置）
 */
export const verifyLuanXiOpposition = (): void => {
  console.log('[INFO] 验证红鸾天喜对宫关系:');
  console.log('年支 | 红鸾 | 天喜 | 差值 | 对宫验证');
  console.log('-----|------|------|------|--------');
  
  TEST_EARTHLY_BRANCHES.forEach(branch => {
    const result = getLuanXiIndex(branch);
    const diff = Math.abs(result.hongluanIndex - result.tianxiIndex);
    const minDiff = Math.min(diff, 12 - diff);
    const isOpposite = minDiff === 6;
    
    console.log(`${branch}   |  ${result.hongluanIndex}   |  ${result.tianxiIndex}   |  ${minDiff}   | ${isOpposite ? '[PASS]' : '[FAIL]'}`);
  });
  
  console.log('\n[DONE] 对宫关系验证完成');
};

/**
 * 验证华盖咸池的分布规律
 * 检查不同地支组的华盖咸池分布是否符合预期
 */
export const verifyHuagaiXianchiDistribution = (): void => {
  console.log('[INFO] 验证华盖咸池分布规律:');
  console.log('地支 | 三合局 | 华盖位置 | 咸池位置');
  console.log('-----|-------|---------|--------');
  
  const groupMap: Record<string, string> = {
    '寅': '火局', '午': '火局', '戌': '火局',
    '申': '水局', '子': '水局', '辰': '水局',
    '巳': '金局', '酉': '金局', '丑': '金局',
    '亥': '木局', '卯': '木局', '未': '木局'
  };
  
  TEST_EARTHLY_BRANCHES.forEach(branch => {
    const result = getHuagaiXianchiIndex(branch);
    const group = groupMap[branch] || '未知';
    console.log(`${branch}   | ${group} | ${result.huagaiIndex.toString().padStart(7)} | ${result.xianchiIndex.toString().padStart(7)}`);
  });
  
  console.log('\n[DONE] 分布规律验证完成');
};

// ==================== 导出 ====================

// 主要导出函数
export { getLuanXiIndex as default };
