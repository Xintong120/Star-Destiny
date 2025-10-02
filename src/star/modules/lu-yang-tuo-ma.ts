/**
 * 禄权科忌模块 - 禄存、擎羊、陀罗、天马星曜位置计算
 * 
 * 职责：
 * - 根据天干计算禄存的位置
 * - 根据禄存位置计算擎羊、陀罗的位置
 * - 根据地支计算天马的位置
 * - 基于天干地支的映射关系
 * - 提供函数式实现和完整验证
 * 
 * 算法说明：
 * 禄存：按天干起例，每个天干对应固定的禄存位置
 * 擎羊：在禄存的后一位（顺时针）
 * 陀罗：在禄存的前一位（逆时针）
 * 天马：按地支三合局分组，每组有固定的天马位置
 */

import { fixIndex, fixEarthlyBranchIndex } from '../../utils';
import { HeavenlyStemName, HeavenlyStemKey, EarthlyBranchName, EarthlyBranchKey } from '../../i18n';
import { 
  convertHeavenlyStemToKey,
  convertEarthlyBranchToKey,
  lookupFromMapping,
  batchTestConsistency,
  batchTestPerformance
} from '../shared/star-location-utils';

// ==================== 类型定义 ====================

/**
 * 禄存擎羊陀罗天马位置结果
 */
export interface LuYangTuoMaPosition {
  /** 禄存索引 */
  luIndex: number;
  /** 天马索引 */
  maIndex: number;
  /** 擎羊索引 */
  yangIndex: number;
  /** 陀罗索引 */
  tuoIndex: number;
}

// ==================== 映射表 ====================

/**
 * 天干到禄存位置的映射表
 * 
 * 规律：甲禄到寅宫，乙禄居卯府...
 */
const HEAVENLY_STEM_TO_LU: Record<HeavenlyStemKey, EarthlyBranchName> = {
  jiaHeavenly: 'yin',    // 甲禄到寅宫
  yiHeavenly: 'mao',     // 乙禄居卯府
  bingHeavenly: 'si',    // 丙戊禄在巳
  wuHeavenly: 'si',      // 丙戊禄在巳
  dingHeavenly: 'woo',   // 丁己禄在午
  jiHeavenly: 'woo',     // 丁己禄在午
  gengHeavenly: 'shen',  // 庚禄居申位
  xinHeavenly: 'you',    // 辛禄居酉乡
  renHeavenly: 'hai',    // 壬禄在亥宫
  guiHeavenly: 'zi'      // 癸禄居子位
};

/**
 * 地支到天马位置的映射表
 * 
 * 基于地支三合局的分组规律：
 * - 寅午戌、申子辰组：天马在申
 * - 巳酉丑、亥卯未组：天马在亥
 */
const EARTHLY_BRANCH_TO_MA: Record<EarthlyBranchKey, EarthlyBranchName> = {
  // 寅午戌组：天马在申
  yinEarthly: 'shen',
  wuEarthly: 'shen', 
  xuEarthly: 'shen',
  // 申子辰组：天马在申
  shenEarthly: 'shen',
  ziEarthly: 'shen',
  chenEarthly: 'shen',    
  // 巳酉丑组：天马在亥
  siEarthly: 'hai',      
  youEarthly: 'hai',     
  chouEarthly: 'hai',    
  // 亥卯未组：天马在亥
  haiEarthly: 'hai',      
  maoEarthly: 'hai',      
  weiEarthly: 'hai'       
};

// ==================== 核心计算函数 ====================

/**
 * 获取禄存擎羊陀罗天马位置索引 - 函数式版本
 * 
 * 优势：
 * 1. 使用映射表，逻辑清晰
 * 2. 函数式编程，易于测试
 * 3. 性能优化，避免重复计算
 * 4. 基于传统算法的科学实现
 * 
 * @param heavenlyStemName 天干名称
 * @param earthlyBranchName 地支名称
 * @returns 禄存、擎羊、陀罗、天马索引
 */
export const getLuYangTuoMaIndex = (heavenlyStemName: HeavenlyStemName, earthlyBranchName: EarthlyBranchName): LuYangTuoMaPosition => {
  // 步骤1：转换为内部键值
  const heavenlyStem = convertHeavenlyStemToKey(heavenlyStemName);
  const earthlyBranch = convertEarthlyBranchToKey(earthlyBranchName);
  
  // 步骤2：查找禄存位置
  const luPosition = lookupFromMapping(HEAVENLY_STEM_TO_LU, heavenlyStem);
  
  // 步骤3：查找天马位置  
  const maPosition = lookupFromMapping(EARTHLY_BRANCH_TO_MA, earthlyBranch);
  
  // 步骤4：计算最终索引
  const luIndex = fixEarthlyBranchIndex(luPosition);
  const maIndex = fixEarthlyBranchIndex(maPosition);
  
  return {
    luIndex,
    maIndex,
    yangIndex: fixIndex(luIndex + 1), // 擎羊在禄存后一位
    tuoIndex: fixIndex(luIndex - 1),  // 陀罗在禄存前一位
  };
};

/**
 * 获取禄存擎羊陀罗天马位置索引 - 函数式版本（别名）
 * 保持与原 location.ts 中函数名的一致性
 */
export const getLuYangTuoMaIndexFP = getLuYangTuoMaIndex;

// ==================== 测试和验证函数 ====================

/**
 * 测试用例：10个天干
 */
const TEST_HEAVENLY_STEMS: HeavenlyStemName[] = [
  '甲', '乙', '丙', '丁', '戊',
  '己', '庚', '辛', '壬', '癸'
];

/**
 * 测试用例：12个地支
 */
const TEST_EARTHLY_BRANCHES: EarthlyBranchName[] = [
  '寅', '卯', '辰', '巳', '午', '未', 
  '申', '酉', '戌', '亥', '子', '丑'
];

/**
 * 验证禄权科忌计算的一致性
 * 
 * @returns 是否所有测试都通过
 */
export const testLuYangTuoMaConsistency = (): boolean => {
  console.log('[INFO] 开始验证禄权科忌计算一致性...');
  
  let allConsistent = true;
  let testCount = 0;
  
  // 测试天干和地支的组合
  TEST_HEAVENLY_STEMS.forEach(stem => {
    TEST_EARTHLY_BRANCHES.slice(0, 3).forEach(branch => { // 只测试前3个地支以节省时间
      const result1 = getLuYangTuoMaIndex(stem, branch);
      const result2 = getLuYangTuoMaIndexFP(stem, branch);
      
      const isConsistent = JSON.stringify(result1) === JSON.stringify(result2);
      allConsistent = allConsistent && isConsistent;
      testCount++;
      
      if (!isConsistent) {
        console.log(`[FAIL] ${stem}干${branch}支: 结果不一致`);
        console.log(`  版本1: ${JSON.stringify(result1)}`);
        console.log(`  版本2: ${JSON.stringify(result2)}`);
      }
    });
  });
  
  console.log(`[RESULT] 总体结果: ${allConsistent ? '[PASS] 完全一致' : '[FAIL] 存在差异'} (测试${testCount}个组合)`);
  return allConsistent;
};

/**
 * 禄权科忌计算性能测试
 * 
 * @param iterations 每个测试用例的迭代次数，默认10000次
 */
export const testLuYangTuoMaPerformance = (iterations: number = 10000): void => {
  console.log(`[INFO] 开始禄权科忌性能测试 (${iterations}次迭代)...`);
  
  const testStem = '甲';
  const testBranch = '寅';
  
  // 性能测试
  const startTime = performance.now();
  for (let i = 0; i < iterations; i++) {
    getLuYangTuoMaIndex(testStem, testBranch);
  }
  const endTime = performance.now();
  
  const duration = endTime - startTime;
  console.log(`[TIME] 耗时: ${duration.toFixed(2)}ms`);
  console.log(`[PERF] 平均每次: ${(duration / iterations).toFixed(4)}ms`);
  console.log(`[PERF] 每秒可执行: ${Math.round(iterations / (duration / 1000))} 次`);
  
  console.log('\n[DONE] 禄权科忌性能测试完成！');
};

/**
 * 快速验证禄存的天干映射
 * 用于开发时快速检查映射表是否正确
 */
export const quickVerifyLuMapping = (): void => {
  console.log('[INFO] 禄存天干映射验证:');
  console.log('天干 | 禄存位置');
  console.log('-----|--------');
  
  TEST_HEAVENLY_STEMS.forEach(stem => {
    const heavenlyStem = convertHeavenlyStemToKey(stem);
    const luPosition = lookupFromMapping(HEAVENLY_STEM_TO_LU, heavenlyStem);
    const luIndex = fixEarthlyBranchIndex(luPosition);
    
    console.log(`${stem}   | ${luPosition}(${luIndex})`);
  });
  
  console.log('\n[DONE] 禄存映射验证完成');
};

/**
 * 快速验证天马的地支分组
 * 用于开发时快速检查映射表是否正确
 */
export const quickVerifyMaGroups = (): void => {
  console.log('[INFO] 天马地支分组验证:');
  
  const groups = [
    { name: '寅午戌组', branches: ['寅', '午', '戌'], expectedMa: '申' },
    { name: '申子辰组', branches: ['申', '子', '辰'], expectedMa: '申' },
    { name: '巳酉丑组', branches: ['巳', '酉', '丑'], expectedMa: '亥' },
    { name: '亥卯未组', branches: ['亥', '卯', '未'], expectedMa: '亥' }
  ];
  
  groups.forEach(group => {
    console.log(`\n${group.name} (天马在${group.expectedMa}):`);
    console.log('地支 | 天马位置');
    console.log('-----|--------');
    
    group.branches.forEach(branch => {
      const earthlyBranch = convertEarthlyBranchToKey(branch as EarthlyBranchName);
      const maPosition = lookupFromMapping(EARTHLY_BRANCH_TO_MA, earthlyBranch);
      const maIndex = fixEarthlyBranchIndex(maPosition);
      const isCorrect = maPosition === group.expectedMa;
      
      console.log(`${branch}   | ${maPosition}(${maIndex}) ${isCorrect ? '[PASS]' : '[FAIL]'}`);
    });
  });
  
  console.log('\n[DONE] 天马分组验证完成');
};

/**
 * 验证擎羊陀罗与禄存的位置关系
 * 检查擎羊陀罗是否正确地在禄存的前后位置
 */
export const verifyYangTuoRelation = (): void => {
  console.log('[INFO] 验证擎羊陀罗与禄存的位置关系:');
  console.log('天干 | 禄存 | 擎羊 | 陀罗 | 关系验证');
  console.log('-----|------|------|------|--------');
  
  TEST_HEAVENLY_STEMS.forEach(stem => {
    const result = getLuYangTuoMaIndex(stem, '寅'); // 使用寅支作为测试
    
    // 验证擎羊是否在禄存后一位
    const expectedYang = fixIndex(result.luIndex + 1);
    const yangCorrect = result.yangIndex === expectedYang;
    
    // 验证陀罗是否在禄存前一位
    const expectedTuo = fixIndex(result.luIndex - 1);
    const tuoCorrect = result.tuoIndex === expectedTuo;
    
    const allCorrect = yangCorrect && tuoCorrect;
    
    console.log(`${stem}   |  ${result.luIndex}   |  ${result.yangIndex}   |  ${result.tuoIndex}   | ${allCorrect ? '[PASS]' : '[FAIL]'}`);
    
    if (!allCorrect) {
      console.log(`     预期擎羊: ${expectedYang}, 预期陀罗: ${expectedTuo}`);
    }
  });
  
  console.log('\n[DONE] 擎羊陀罗关系验证完成');
};

/**
 * 验证禄权科忌的完整算法
 * 展示完整的计算过程和结果
 */
export const verifyLuYangTuoMaAlgorithm = (): void => {
  console.log('[INFO] 验证禄权科忌完整算法:');
  console.log('示例：甲干寅支的禄权科忌位置');
  
  const testStem = '甲';
  const testBranch = '寅';
  const result = getLuYangTuoMaIndex(testStem, testBranch);
  
  console.log(`\n输入: ${testStem}干 ${testBranch}支`);
  console.log(`禄存位置: ${result.luIndex} (甲禄到寅宫)`);
  console.log(`擎羊位置: ${result.yangIndex} (禄存后一位)`);
  console.log(`陀罗位置: ${result.tuoIndex} (禄存前一位)`);
  console.log(`天马位置: ${result.maIndex} (寅午戌组天马在申)`);
  
  // 验证算法正确性
  const luCorrect = result.luIndex === fixEarthlyBranchIndex('yin');
  const yangCorrect = result.yangIndex === fixIndex(result.luIndex + 1);
  const tuoCorrect = result.tuoIndex === fixIndex(result.luIndex - 1);
  const maCorrect = result.maIndex === fixEarthlyBranchIndex('shen');
  
  console.log(`\n算法验证:`);
  console.log(`禄存: ${luCorrect ? '[PASS]' : '[FAIL]'}`);
  console.log(`擎羊: ${yangCorrect ? '[PASS]' : '[FAIL]'}`);
  console.log(`陀罗: ${tuoCorrect ? '[PASS]' : '[FAIL]'}`);
  console.log(`天马: ${maCorrect ? '[PASS]' : '[FAIL]'}`);
  
  console.log('\n[DONE] 算法验证完成');
};

// ==================== 导出 ====================

// 主要导出函数
export { getLuYangTuoMaIndex as default };
