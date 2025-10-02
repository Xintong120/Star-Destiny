/**
 * 星曜位置计算模块主入口文件
 * 
 * 职责：
 * - 重新导出所有拆分后的模块函数
 * - 保持与原 location.ts 的完全向后兼容
 * - 提供统一的导入接口
 * - 支持按需导入和批量导入
 * 
 * 使用方法：
 * ```typescript
 * // 批量导入（与原 location.ts 兼容）
 * import { getKuiYueIndex, getZuoYouIndex } from './modules';
 * 
 * // 按需导入特定模块
 * import { getKuiYueIndex } from './modules/kui-yue';
 * import { getZuoYouIndex } from './modules/zuo-you';
 * ```
 */

// ==================== 天魁天钺模块 ====================
export {
  getKuiYueIndex,
  getKuiYueIndexFP,
  testKuiYueConsistency,
  testKuiYuePerformance,
  quickVerifyKuiYue,
  type KuiYuePosition
} from './kui-yue';

// ==================== 左辅右弼模块 ====================
export {
  getZuoYouIndex,
  getZuoYouIndexFP,
  testZuoYouConsistency,
  testZuoYouPerformance,
  quickVerifyZuoYou,
  verifyZuoYouSymmetry,
  type ZuoYouPosition
} from './zuo-you';

// ==================== 地空地劫模块 ====================
export {
  getKongJieIndex,
  getKongJieIndexFP,
  testKongJieConsistency,
  testKongJiePerformance,
  quickVerifyKongJie,
  verifyKongJieSymmetry,
  verifyKongJieWithHai,
  type KongJiePosition
} from './kong-jie';

// ==================== 文昌文曲模块 ====================
export {
  getChangQuIndex,
  getChangQuIndexFP,
  getChangQuIndexByHeavenlyStem,
  getChangQuIndexByHeavenlyStemFP,
  testChangQuConsistency,
  testChangQuByHeavenlyStemConsistency,
  testChangQuPerformance,
  testChangQuByHeavenlyStemPerformance,
  quickVerifyChangQu,
  quickVerifyChangQuByHeavenlyStem,
  verifyChangQuSymmetry,
  verifyChangQuWithChenXu,
  type ChangQuPosition
} from './chang-qu';

// ==================== 火星铃星模块 ====================
export {
  getHuoLingIndex,
  getHuoLingIndexFP,
  testHuoLingConsistency,
  testHuoLingPerformance,
  quickVerifyHuoLingGroups,
  verifyHuoLingTimeOffset,
  verifyHuoLingDistribution,
  type HuoLingPosition
} from './huo-ling';

// ==================== 桃花星模块 ====================
export {
  getLuanXiIndex,
  getHuagaiXianchiIndex,
  getHuagaiXianchiIndexFP,
  testLuanXiConsistency,
  testHuagaiXianchiConsistency,
  testLuanXiPerformance,
  testHuagaiXianchiPerformance,
  quickVerifyLuanXi,
  quickVerifyHuagaiXianchiGroups,
  verifyLuanXiOpposition,
  verifyHuagaiXianchiDistribution,
  type LuanXiPosition,
  type HuagaiXianchiPosition
} from './peach-blossom-stars';

// ==================== 孤辰寡宿模块 ====================
export {
  getGuGuaIndex,
  getGuGuaIndexFP,
  testGuGuaConsistency,
  testGuGuaPerformance,
  quickVerifyGuGuaGroups,
  verifyGuGuaDistribution,
  verifyGuGuaSymmetry,
  verifyGuGuaAlgorithm,
  type GuGuaPosition
} from './gu-gua';

// ==================== 禄权科忌模块 ====================
export {
  getLuYangTuoMaIndex,
  getLuYangTuoMaIndexFP,
  testLuYangTuoMaConsistency,
  testLuYangTuoMaPerformance,
  quickVerifyLuMapping,
  quickVerifyMaGroups,
  verifyYangTuoRelation,
  verifyLuYangTuoMaAlgorithm,
  type LuYangTuoMaPosition
} from './lu-yang-tuo-ma';

// ==================== 共享工具模块 ====================
export {
  normalizeTimeIndex,
  getBasePosition,
  convertEarthlyBranchToKey,
  convertHeavenlyStemToKey,
  calculateForwardStarIndex,
  calculateReverseStarIndex,
  lookupFromMapping,
  safeLookupFromMapping,
  compareResults,
  measurePerformance,
  batchTestConsistency,
  batchTestPerformance,
  type StarPositionResult,
  type DualStarPosition
} from '../shared/star-location-utils';

// ==================== 便捷导出 ====================

// 注意：StarCalculators 和 StarTestSuite 对象已移除，以避免循环依赖问题
// 用户可以直接导入需要的函数，或者使用 import * as StarModules from './modules' 的方式

// ==================== 说明 ====================

/**
 * 批量测试和验证功能已移除，以避免循环依赖问题
 * 
 * 如需使用批量测试功能，请直接导入各个模块的测试函数：
 * 
 * ```typescript
 * import { testKuiYueConsistency } from './kui-yue';
 * import { testZuoYouConsistency } from './zuo-you';
 * // ... 其他模块
 * 
 * // 然后手动调用
 * testKuiYueConsistency();
 * testZuoYouConsistency();
 * ```
 * 
 * 或者使用浏览器控制台测试脚本 console-test.js
 */
