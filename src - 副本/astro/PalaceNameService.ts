import { PALACES } from '../data';
import { PalaceName, t } from '../i18n';
import { fixIndex } from '../utils';

/**
 * 宫位名称服务类
 * 专门处理宫位名称相关的逻辑，提供宫位名称获取和宫位关系计算功能
 * 在紫微斗数中，宫位之间的关系是分析命盘的重要依据
 */
export default class PalaceNameService {
  /**
   * 获取从寅宫开始的各个宫名
   * 根据命宫索引计算出十二宫的名称排列
   *
   * @param fromIndex 命宫索引
   * @returns 从寅宫开始的各个宫名
   */
  static getPalaceNames(fromIndex: number): PalaceName[] {
    const names: PalaceName[] = [];

    // 遍历十二宫
    for (let i = 0; i < PALACES.length; i++) {
      // 计算相对位置，确保索引在0-11范围内
      const idx = fixIndex(i - fromIndex);

      // 获取宫位名称并添加到结果数组
      names[i] = t(PALACES[idx]) as PalaceName;
    }

    return names;
  }

  /**
   * 获取大限宫位名称
   * 返回标准的大限宫位名称顺序数组
   * 注意：对于第一个大限，实际使用时应与本命宫位名称保持一致
   * 对于后续大限，根据性别和年干确定顺/逆时针方向:
   * - 阳男阴女逆行：如果是阳年干(甲丙戊庚壬)男命或阴年干(乙丁己辛癸)女命，则逆时针
   * - 阴男阳女顺行：如果是阴年干(乙丁己辛癸)男命或阳年干(甲丙戊庚壬)女命，则顺时针
   * 每个大限跨越10年，大限顺序以本命为基准，按顺/逆时针方向每大限偏移一个宫位
   * 大限宫位顺序：官禄,仆役,迁移,疾厄,财帛,子女,夫妻,兄弟,命宫,父母,福德,田宅
   *
   * @param fromIndex 命宫索引（此参数在此方法中不使用，保留是为了与getPalaceNames方法签名一致）
   * @returns 大限宫位名称数组
   */
  static getDecadalPalaceNames(fromIndex: number): PalaceName[] {
    const names: PalaceName[] = [];
    
    // 大限宫位顺序映射
    // 注意：这只是标准的大限宫位顺序，实际应用时需考虑:
    // 1. 第一个大限应与本命宫位名称一致
    // 2. 后续大限根据性别和年干确定顺/逆时针方向偏移
    const decadalOrder = [
      'careerPalace',    // 官禄
      'surfacePalace',   // 仆役
      'wealthPalace',    // 迁移
      'healthPalace',    // 疾厄
      'propertyPalace',  // 财帛
      'childrenPalace',  // 子女
      'spousePalace',    // 夫妻
      'siblingsPalace',  // 兄弟
      'soulPalace',      // 命宫
      'parentsPalace',   // 父母
      'spiritPalace',    // 福德
      'friendsPalace'    // 田宅
    ];

    // 遍历十二宫
    for (let i = 0; i < decadalOrder.length; i++) {
      // 获取宫位名称并添加到结果数组
      names[i] = t(decadalOrder[i]) as PalaceName;
    }

    return names;
  }

  /**
   * 获取宫位的对宫索引
   * 对宫是指与当前宫位相对的宫位，相隔六个宫位
   * 在紫微斗数中，对宫关系常用于分析宫位之间的相互影响
   * 
   * @param index 宫位索引
   * @returns 对宫索引
   */
  static getOppositePalaceIndex(index: number): number {
    // 加6取模12，得到对宫索引
    return (index + 6) % 12;
  }

  /**
   * 获取宫位的财帛位索引
   * 财帛位是指与当前宫位成120度角的宫位，相隔三个宫位
   * 在紫微斗数中，财帛位关系用于分析财运和资源获取
   * 
   * @param index 宫位索引
   * @returns 财帛位索引
   */
  static getWealthPalaceIndex(index: number): number {
    // 加3取模12，得到财帛位索引
    return (index + 3) % 12;
  }

  /**
   * 获取宫位的官禄位索引
   * 官禄位是指与当前宫位成120度角的另一个宫位，相隔九个宫位
   * 在紫微斗数中，官禄位关系用于分析事业和成就
   * 
   * @param index 宫位索引
   * @returns 官禄位索引
   */
  static getCareerPalaceIndex(index: number): number {
    // 加9取模12，得到官禄位索引
    return (index + 9) % 12;
  }

  /**
   * 获取宫位的三方四正索引
   * 三方四正是紫微斗数中的重要概念，包括本宫、对宫、财帛位和官禄位
   * 这四个宫位的组合关系对命盘分析有重要意义
   * 
   * @param index 宫位索引
   * @returns 三方四正索引数组 [本宫索引, 对宫索引, 财帛位索引, 官禄位索引]
   */
  static getSurroundedPalaceIndices(index: number): number[] {
    return [
      index,                                      // 本宫
      PalaceNameService.getOppositePalaceIndex(index),  // 对宫
      PalaceNameService.getWealthPalaceIndex(index),    // 财帛位
      PalaceNameService.getCareerPalaceIndex(index)     // 官禄位
    ];
  }
}

// 导出函数版本，方便直接调用
/**
 * 获取宫位名称数组
 * @param fromIndex 起始宫位索引
 * @returns 宫位名称数组
 */
export const getPalaceNames = PalaceNameService.getPalaceNames;

/**
 * 获取大限宫位名称数组
 * @param fromIndex 起始宫位索引
 * @returns 大限宫位名称数组
 */
export const getDecadalPalaceNames = PalaceNameService.getDecadalPalaceNames;

/**
 * 获取对宫索引
 * @param index 宫位索引
 * @returns 对宫索引
 */
export const getOppositePalaceIndex = PalaceNameService.getOppositePalaceIndex;

/**
 * 获取财帛位索引
 * @param index 宫位索引
 * @returns 财帛位索引
 */
export const getWealthPalaceIndex = PalaceNameService.getWealthPalaceIndex;

/**
 * 获取官禄位索引
 * @param index 宫位索引
 * @returns 官禄位索引
 */
export const getCareerPalaceIndex = PalaceNameService.getCareerPalaceIndex;

/**
 * 获取三方四正索引数组
 * @param index 宫位索引
 * @returns 三方四正索引数组
 */
export const getSurroundedPalaceIndices = PalaceNameService.getSurroundedPalaceIndices;