import { Astrolabe, Plugin } from '../data/types';
import { PalaceName, StarKey, StarName, kot } from '../i18n';
import { IFunctionalStar } from '../star/FunctionalStar';
import { getPalace, getSurroundedPalaces } from './analyzer';
import { IFunctionalPalace } from './FunctionalPalace';
import { IFunctionalSurpalaces } from './FunctionalSurpalaces';
import { IFunctionalHoroscope } from './FunctionalHoroscope';
import HoroscopeCalculator from './HoroscopeCalculator';


/**
 * 星盘类接口定义。
 * 定义了紫微斗数星盘的基本结构和方法。
 *
 * 文档地址：https://docs.iztro.com/posts/astrolabe.html#functionalastrolabe
 */
export interface IFunctionalAstrolabe extends Astrolabe {
  /**
   * 插件注入方法
   * 用于扩展星盘功能，通过插件机制添加新的功能
   *
   * @version v2.3.0
   *
   * @param plugin 插件函数
   */
  use(plugin: Plugin): void;
  
  /**
   * 获取运限数据
   * 根据指定日期计算运限信息，包括大限、流年、流月、流日、流时等
   *
   * @version v0.2.0
   *
   * @param date 阳历日期【可选】，默认为调用时的日期
   * @param timeIndex 时辰索引【可选】，默认会自动读取当前时间的时辰
   * @returns 运限数据
   */
  horoscope: (date?: string | Date, timeIndex?: number) => IFunctionalHoroscope;

  /**
   * 通过星耀名称获取到当前星耀的对象实例
   * 根据星耀名称查找并返回对应的星耀对象
   *
   * @version v1.2.0
   *
   * @param starName 星耀名称
   * @returns 星耀实例
   */
  star: (starName: StarName) => IFunctionalStar;

  /**
   * 获取星盘的某一个宫位
   * 根据宫位索引或宫位名称查找并返回对应的宫位
   *
   * @version v1.0.0
   *
   * @param indexOrName 宫位索引或者宫位名称
   * @returns 对应的宫位数据，若没有找到则返回undefined
   */
  palace: (indexOrName: number | PalaceName) => IFunctionalPalace | undefined;

  /**
   * 获取三方四正宫位，所谓三方四正就是传入的目标宫位，以及其对宫，财帛位和官禄位，总共四个宫位
   * 三方四正是紫微斗数中的重要概念，用于分析宫位之间的关系
   *
   * @version v1.1.0
   *
   * @param indexOrName 宫位索引或者宫位名称
   * @returns 三方四正宫位
   */
  surroundedPalaces: (indexOrName: number | PalaceName) => IFunctionalSurpalaces;

  /**
   * 判断某一个宫位三方四正是否包含目标星耀，必须要全部包含才会返回true
   * 用于检查指定的星耀是否全部出现在三方四正宫位中
   *
   * @version v1.0.0
   *
   * @param indexOrName 宫位索引或者宫位名称
   * @param stars 星耀名称数组
   * @returns true | false
   */
  isSurrounded: (indexOrName: number | PalaceName, stars: StarName[]) => boolean;

  /**
   * 判断三方四正内是否有传入星耀的其中一个，只要命中一个就会返回true
   * 用于检查指定的星耀中是否有任意一个出现在三方四正宫位中
   *
   * @version v1.1.0
   * @deprecated v1.2.0
   *
   * @param indexOrName 宫位索引或者宫位名称
   * @param stars 星耀名称数组
   * @returns true | false
   */
  isSurroundedOneOf: (indexOrName: number | PalaceName, stars: StarName[]) => boolean;

  /**
   * 判断某一个宫位三方四正是否不含目标星耀，必须要全部都不在三方四正内含才会返回true
   * 用于检查指定的星耀是否全部不出现在三方四正宫位中
   *
   * @version v1.1.0
   * @deprecated v1.2.0
   *
   * @param indexOrName 宫位索引或者宫位名称
   * @param stars 星耀名称数组
   * @returns true | false
   */
  notSurrounded: (indexOrName: number | PalaceName, stars: StarName[]) => boolean;
}

/**
 * 星盘类。
 * 实现了IFunctionalAstrolabe接口，提供紫微斗数星盘的核心功能
 *
 * 文档地址：https://docs.iztro.com/posts/astrolabe.html#functionalastrolabe
 */
export default class FunctionalAstrolabe implements IFunctionalAstrolabe {
  // 基本属性
  gender;                         // 性别
  solarDate;                      // 阳历日期
  lunarDate;                      // 农历日期
  chineseDate;                    // 中文日期
  rawDates;                       // 原始日期数据
  time;                           // 时间
  timeRange;                      // 时间范围
  sign;                           // 星座
  zodiac;                         // 生肖
  earthlyBranchOfSoulPalace;      // 命宫地支
  earthlyBranchOfBodyPalace;      // 身宫地支
  soul;                           // 命宫
  body;                           // 身宫
  fiveElementsClass;              // 五行属性
  palaces;                        // 宫位数组
  copyright;                      // 版权信息

  // 保存插件列表
  private plugins: Plugin[] = [];

  /**
   * 构造函数
   * 初始化星盘对象，设置基本属性
   * 
   * @param data 星盘数据
   */
  constructor(data: Astrolabe) {
    this.gender = data.gender;
    this.solarDate = data.solarDate;
    this.lunarDate = data.lunarDate;
    this.chineseDate = data.chineseDate;
    this.rawDates = data.rawDates;
    this.time = data.time;
    this.timeRange = data.timeRange;
    this.sign = data.sign;
    this.zodiac = data.zodiac;
    this.earthlyBranchOfBodyPalace = data.earthlyBranchOfBodyPalace;
    this.earthlyBranchOfSoulPalace = data.earthlyBranchOfSoulPalace;
    this.soul = data.soul;
    this.body = data.body;
    this.fiveElementsClass = data.fiveElementsClass;
    this.palaces = data.palaces;
    this.copyright = data.copyright;

    return this;
  }

  /**
   * 插件注入方法
   * 将插件添加到插件列表并应用到星盘对象
   * 
   * @param plugin 插件函数
   */
  use(plugin: Plugin): void {
    this.plugins.push(plugin);
    plugin.apply(this);
  }

  /**
   * 通过星耀名称获取星耀对象
   * 在所有宫位中查找指定名称的星耀
   * 
   * @param starName 星耀名称
   * @returns 星耀对象
   */
  star = (starName: StarName): IFunctionalStar => {
    let targetStar: IFunctionalStar | undefined;

    this.palaces.some((p) => {
      [...p.majorStars, ...p.minorStars, ...p.adjectiveStars].some((item) => {
        if (kot<StarKey>(item.name) === kot<StarKey>(starName)) {
          targetStar = item;
          // 确保targetStar不为undefined后再调用方法
          if (targetStar) {
          targetStar.setPalace(p);
          targetStar.setAstrolabe(this);
          }
          return true;
        }
        return false;
      });
      return targetStar !== undefined;
    });

    if (!targetStar) {
      throw new Error('invalid star name.');
    }

    return targetStar;
  };

  /**
   * 获取运限数据
   * 调用HoroscopeCalculator计算运限信息
   * 
   * @param targetDate 目标日期
   * @param timeIndexOfTarget 时辰索引
   * @returns 运限数据
   */
  horoscope = (targetDate: string | Date = new Date(), timeIndexOfTarget?: number) =>
    HoroscopeCalculator.calculateHoroscope(this, targetDate, timeIndexOfTarget);

  /**
   * 获取宫位
   * 根据索引或名称获取宫位
   * 
   * @param indexOrName 宫位索引或名称
   * @returns 宫位对象
   */
  palace = (indexOrName: number | PalaceName): IFunctionalPalace | undefined => getPalace(this, indexOrName);

  /**
   * 获取三方四正宫位
   * 
   * @param indexOrName 宫位索引或名称
   * @returns 三方四正宫位对象
   */
  surroundedPalaces = (indexOrName: number | PalaceName): IFunctionalSurpalaces =>
    getSurroundedPalaces(this, indexOrName);

  /**
   * @deprecated 此方法已在`v1.2.0`废弃，请用下列方法替换
   *
   * @example
   *  // AS IS
   *  astrolabe.isSurrounded(0, ["紫微"]);
   *
   *  // TO BE
   *  astrolabe.surroundedPalaces(0).have(["紫微"]);
   */
  isSurrounded = (indexOrName: number | PalaceName, stars: StarName[]): boolean =>
    this.surroundedPalaces(indexOrName).have(stars);

  /**
   * @deprecated 此方法已在`v1.2.0`废弃，请用下列方法替换
   *
   * @example
   *  // AS IS
   *  astrolabe.isSurroundedOneOf(0, ["紫微"]);
   *
   *  // TO BE
   *  astrolabe.surroundedPalaces(0).haveOneOf(["紫微"]);
   */
  isSurroundedOneOf = (indexOrName: number | PalaceName, stars: StarName[]): boolean =>
    this.surroundedPalaces(indexOrName).haveOneOf(stars);

  /**
   * @deprecated 此方法已在`v1.2.0`废弃，请用下列方法替换
   *
   * @example
   *  // AS IS
   *  astrolabe.notSurrounded(0, ["紫微"]);
   *
   *  // TO BE
   *  astrolabe.surroundedPalaces(0).notHave(["紫微"]);
   */
  notSurrounded = (indexOrName: number | PalaceName, stars: StarName[]): boolean =>
    this.surroundedPalaces(indexOrName).notHave(stars);
}
