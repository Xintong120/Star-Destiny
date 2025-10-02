/**
 * 孤辰寡宿星曜位置计算模块
 * 
 * 职责：
 * - 根据年支计算孤辰寡宿的位置
 * - 基于地支三合局的映射关系
 * - 提供函数式实现和完整验证
 * 
 * 算法说明：
 * 孤辰寡宿按地支三合局分组：
 * - 寅卯辰年安巳丑：孤辰在巳，寡宿在丑
 * - 巳午未年安申辰：孤辰在申，寡宿在辰
 * - 申酉戍年安亥未：孤辰在亥，寡宿在未
 * - 亥子丑年安寅戍：孤辰在寅，寡宿在戌
 */

import { fixIndex, fixEarthlyBranchIndex } from '../../utils';
import { EarthlyBranchName, EarthlyBranchKey } from '../../i18n';
import { 
  convertEarthlyBranchToKey,
  lookupFromMapping,
  batchTestConsistency,
  batchTestPerformance
} from '../shared/star-location-utils';

// ==================== 类型定义 ====================

/**
 * 孤辰寡宿位置结果
 */
export interface GuGuaPosition {
  /** 孤辰索引 */
  guchenIndex: number;
  /** 寡宿索引 */
  guasuIndex: number;
}

/**
 * 孤辰寡宿位置配置
 */
interface GuGuaConfig {
  /** 孤辰位置 */
  guchen: EarthlyBranchName;
  /** 寡宿位置 */
  guasu: EarthlyBranchName;
}

// ==================== 映射表 ====================

/**
 * 地支组到孤辰寡宿位置的映射表
 * 
 * 基于地支三合局的分组规律：
 * - 寅卯辰组：孤辰在巳，寡宿在丑
 * - 巳午未组：孤辰在申，寡宿在辰
 * - 申酉戌组：孤辰在亥，寡宿在未
 * - 亥子丑组：孤辰在寅，寡宿在戌
 */
const EARTHLY_BRANCH_TO_GU_GUA: Record<EarthlyBranchKey, GuGuaConfig> = {
  // 寅卯辰组：孤辰在巳，寡宿在丑
  yinEarthly: { guchen: 'si', guasu: 'chou' },
  maoEarthly: { guchen: 'si', guasu: 'chou' },
  chenEarthly: { guchen: 'si', guasu: 'chou' },
  
  // 巳午未组：孤辰在申，寡宿在辰
  siEarthly: { guchen: 'shen', guasu: 'chen' },
  wuEarthly: { guchen: 'shen', guasu: 'chen' },
  weiEarthly: { guchen: 'shen', guasu: 'chen' },
  
  // 申酉戌组：孤辰在亥，寡宿在未
  shenEarthly: { guchen: 'hai', guasu: 'wei' },
  youEarthly: { guchen: 'hai', guasu: 'wei' },
  xuEarthly: { guchen: 'hai', guasu: 'wei' },
  
  // 亥子丑组：孤辰在寅，寡宿在戌
  haiEarthly: { guchen: 'yin', guasu: 'xu' },
  ziEarthly: { guchen: 'yin', guasu: 'xu' },
  chouEarthly: { guchen: 'yin', guasu: 'xu' }
};

// ==================== 核心计算函数 ====================

/**
 * 获取孤辰寡宿位置索引 - 函数式版本
 * 
 * 优势：
 * 1. 使用映射表，逻辑清晰
 * 2. 函数式编程，易于测试
 * 3. 性能优化，避免重复计算
 * 4. 基于地支三合局的科学分组
 * 
 * @param earthlyBranchName 地支名称
 * @returns 孤辰、寡宿索引
 */
export const getGuGuaIndex = (earthlyBranchName: EarthlyBranchName): GuGuaPosition => {
  // 步骤1：转换为内部键值
  const earthlyBranch = convertEarthlyBranchToKey(earthlyBranchName);
  
  // 步骤2：查找孤辰寡宿位置
  const positions = lookupFromMapping(EARTHLY_BRANCH_TO_GU_GUA, earthlyBranch);
  
  // 步骤3：计算最终索引
  const guchenIndex = fixIndex(fixEarthlyBranchIndex(positions.guchen));
  const guasuIndex = fixIndex(fixEarthlyBranchIndex(positions.guasu));
  
  return { guchenIndex, guasuIndex };
};

/**
 * 获取孤辰寡宿位置索引 - 函数式版本（别名）
 * 保持与原 location.ts 中函数名的一致性
 */
export const getGuGuaIndexFP = getGuGuaIndex;

// ==================== 测试和验证函数 ====================

/**
 * 测试用例：12个地支
 */
const TEST_EARTHLY_BRANCHES: EarthlyBranchName[] = [
  '寅', '卯', '辰', '巳', '午', '未', 
  '申', '酉', '戌', '亥', '子', '丑'
];

/**
 * 验证孤辰寡宿计算的一致性
 * 
 * @returns 是否所有测试都通过
 */
export const testGuGuaConsistency = (): boolean => {
  return batchTestConsistency(
    TEST_EARTHLY_BRANCHES,
    getGuGuaIndex,
    getGuGuaIndexFP,
    'getGuGuaIndex'
  );
};

/**
 * 孤辰寡宿计算性能测试
 * 
 * @param iterations 每个测试用例的迭代次数，默认10000次
 */
export const testGuGuaPerformance = (iterations: number = 10000): void => {
  batchTestPerformance(
    TEST_EARTHLY_BRANCHES,
    getGuGuaIndex,
    getGuGuaIndexFP,
    'getGuGuaIndex',
    iterations
  );
};

/**
 * 快速验证孤辰寡宿的三合局分组
 * 用于开发时快速检查映射表是否正确
 */
export const quickVerifyGuGuaGroups = (): void => {
  console.log('[INFO] 孤辰寡宿三合局分组验证:');
  
  const groups = [
    { name: '寅卯辰组', branches: ['寅', '卯', '辰'] },
    { name: '巳午未组', branches: ['巳', '午', '未'] },
    { name: '申酉戌组', branches: ['申', '酉', '戌'] },
    { name: '亥子丑组', branches: ['亥', '子', '丑'] }
  ];
  
  groups.forEach(group => {
    console.log(`\n${group.name}:`);
    console.log('地支 | 孤辰位置 | 寡宿位置');
    console.log('-----|---------|--------');
    
    group.branches.forEach(branch => {
      const result = getGuGuaIndex(branch as EarthlyBranchName);
      console.log(`${branch}   | ${result.guchenIndex.toString().padStart(7)} | ${result.guasuIndex.toString().padStart(7)}`);
    });
  });
  
  console.log('\n[DONE] 三合局分组验证完成');
};

/**
 * 验证孤辰寡宿的分布规律
 * 检查不同地支组的孤辰寡宿分布是否符合预期
 */
export const verifyGuGuaDistribution = (): void => {
  console.log('[INFO] 验证孤辰寡宿分布规律:');
  console.log('地支 | 地支组 | 孤辰位置 | 寡宿位置');
  console.log('-----|-------|---------|--------');
  
  const groupMap: Record<string, string> = {
    '寅': '寅卯辰', '卯': '寅卯辰', '辰': '寅卯辰',
    '巳': '巳午未', '午': '巳午未', '未': '巳午未',
    '申': '申酉戌', '酉': '申酉戌', '戌': '申酉戌',
    '亥': '亥子丑', '子': '亥子丑', '丑': '亥子丑'
  };
  
  TEST_EARTHLY_BRANCHES.forEach(branch => {
    const result = getGuGuaIndex(branch);
    const group = groupMap[branch] || '未知';
    console.log(`${branch}   | ${group} | ${result.guchenIndex.toString().padStart(7)} | ${result.guasuIndex.toString().padStart(7)}`);
  });
  
  console.log('\n[DONE] 分布规律验证完成');
};

/**
 * 验证孤辰寡宿的对称性
 * 检查孤辰寡宿在命盘中的分布关系
 */
export const verifyGuGuaSymmetry = (): void => {
  console.log('[INFO] 验证孤辰寡宿的对称性:');
  console.log('地支 | 孤辰 | 寡宿 | 距离');
  console.log('-----|------|------|-----');
  
  TEST_EARTHLY_BRANCHES.forEach(branch => {
    const result = getGuGuaIndex(branch);
    const distance = Math.abs(result.guchenIndex - result.guasuIndex);
    const minDistance = Math.min(distance, 12 - distance);
    
    console.log(`${branch}   |  ${result.guchenIndex}   |  ${result.guasuIndex}   |  ${minDistance}`);
  });
  
  console.log('\n[DONE] 对称性验证完成');
};

/**
 * 验证孤辰寡宿的算法规律
 * 检查是否符合传统口诀的规律
 */
export const verifyGuGuaAlgorithm = (): void => {
  console.log('[INFO] 验证孤辰寡宿算法规律:');
  console.log('根据口诀：寅卯辰年安巳丑，巳午未年安申辰，申酉戍年安亥未，亥子丑年安寅戍');
  console.log('');
  
  const expectedResults = {
    '寅卯辰': { guchen: '巳', guasu: '丑' },
    '巳午未': { guchen: '申', guasu: '辰' },
    '申酉戌': { guchen: '亥', guasu: '未' },
    '亥子丑': { guchen: '寅', guasu: '戌' }
  };
  
  const groups = [
    { name: '寅卯辰', branches: ['寅', '卯', '辰'] },
    { name: '巳午未', branches: ['巳', '午', '未'] },
    { name: '申酉戌', branches: ['申', '酉', '戌'] },
    { name: '亥子丑', branches: ['亥', '子', '丑'] }
  ];
  
  groups.forEach(group => {
    const expected = expectedResults[group.name as keyof typeof expectedResults];
    const expectedGuchenIndex = fixEarthlyBranchIndex(expected.guchen as EarthlyBranchName);
    const expectedGuasuIndex = fixEarthlyBranchIndex(expected.guasu as EarthlyBranchName);
    
    console.log(`${group.name}组 - 预期: 孤辰${expected.guchen}(${expectedGuchenIndex}) 寡宿${expected.guasu}(${expectedGuasuIndex})`);
    
    group.branches.forEach(branch => {
      const result = getGuGuaIndex(branch as EarthlyBranchName);
      const guchenCorrect = result.guchenIndex === expectedGuchenIndex;
      const guasuCorrect = result.guasuIndex === expectedGuasuIndex;
      const allCorrect = guchenCorrect && guasuCorrect;
      
      console.log(`  ${branch}支: 孤辰${result.guchenIndex}${guchenCorrect ? '[PASS]' : '[FAIL]'} 寡宿${result.guasuIndex}${guasuCorrect ? '[PASS]' : '[FAIL]'} ${allCorrect ? '[PASS]' : '[FAIL]'}`);
    });
    console.log('');
  });
  
  console.log('[DONE] 算法规律验证完成');
};

// ==================== 导出 ====================

// 主要导出函数
export { getGuGuaIndex as default };
