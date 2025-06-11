import { Horoscope, Scope } from '../data/types';
import { Mutagen, MutagenKey, PalaceName, StarKey, StarName, kot } from '../i18n';
import { IFunctionalAstrolabe } from './FunctionalAstrolabe';
import { IFunctionalSurpalaces } from './FunctionalSurpalaces';
import { IFunctionalPalace } from './FunctionalPalace';
import { mergeStars } from '../utils';
import { MUTAGEN } from '../data';

/**
 * 获取运限宫位索引
 * 根据宫位名称和运限范围获取对应的宫位索引
 * 
 * @param $ 运限对象
 * @param scope 运限范围（原命盘或特定运限）
 * @param palaceName 宫位名称
 * @returns 宫位索引，如果未找到返回-1
 */
const _getHoroscopePalaceIndex = ($: IFunctionalHoroscope, scope: Scope, palaceName: PalaceName) => {
  let palaceIndex = -1;

  // 如果是原命盘，直接从命盘宫位中查找
  if (scope === 'origin') {
    $.astrolabe.palaces.some((p, idx) => {
      if (p.name === palaceName) {
        palaceIndex = idx;

        return true;
      }

      return false;
    });
  } else {
    // 如果是特定运限，从运限宫位名称中查找
    palaceIndex = $[scope].palaceNames.indexOf(palaceName);
  }

  return palaceIndex;
};

/**
 * 运限功能接口
 * 定义了运限数据的结构和方法，提供对运限数据的访问和分析功能
 */
export interface IFunctionalHoroscope extends Horoscope {
  astrolabe: IFunctionalAstrolabe;
  /**
   * 获取小限宫位
   * 返回当前小限对应的宫位
   *
   * @version v1.3.0
   *
   * @returns {IFunctionalPalace | undefined} 小限宫位
   */
  agePalace: () => IFunctionalPalace | undefined;

  /**
   * 获取运限宫位
   * 根据宫位名称和运限范围获取对应的宫位
   *
   * @version v1.3.0
   *
   * @param palaceName 宫位名称
   * @param scope 指定获取哪个运限的宫位
   * @returns {IFunctionalPalace | undefined} 指定宫位
   */
  palace: (palaceName: PalaceName, scope: Scope) => IFunctionalPalace | undefined;

  /**
   * 获取运限指定宫位的三方四正宫位
   * 返回特定运限中指定宫位的三方四正关系
   *
   * @version v1.3.0
   *
   * @param palaceName 宫位名称
   * @param scope 指定获取哪个运限的宫位
   * @returns {IFunctionalSurpalaces | undefined} 指定宫位的三方四正
   */
  surroundPalaces: (palaceName: PalaceName, scope: Scope) => IFunctionalSurpalaces | undefined;

  /**
   * 判断在指定运限的宫位内是否包含流耀，需要全部包含才返回true
   * 检查特定宫位是否包含所有指定的流耀星
   *
   * @version v1.3.0
   *
   * @param palaceName 宫位名称
   * @param scope 指定获取哪个运限的宫位
   * @param horoscopeStar 流耀
   * @returns {boolean} 是否包含指定流耀
   */
  hasHoroscopeStars: (palaceName: PalaceName, scope: Scope, horoscopeStar: StarName[]) => boolean;

  /**
   * 判断指定运限宫位内是否不含流耀，需要全部不包含才返回true
   * 检查特定宫位是否不包含任何指定的流耀星
   *
   * @version v1.3.2
   *
   * @param palaceName 宫位名称
   * @param scope 指定获取哪个运限的宫位
   * @param horoscope 流耀
   * @returns {boolean} 是否不含指定流耀
   */
  notHaveHoroscopeStars: (palaceName: PalaceName, scope: Scope, horoscope: StarName[]) => boolean;

  /**
   * 判断指定运限宫位内是否含有指定流耀，只要包含其中一颗就返回true
   * 检查特定宫位是否包含至少一颗指定的流耀星
   *
   * @version v1.3.3
   *
   * @param palaceName 宫位名称
   * @param scope 指定获取哪个运限的宫位
   * @param horoscope 流耀
   * @returns {boolean} 是否含有（部分）指定流耀中
   */
  hasOneOfHoroscopeStars: (palaceName: PalaceName, scope: Scope, horoscopeStar: StarName[]) => boolean;

  /**
   * 判断指定运限宫位内是否存在运限四化
   * 检查特定宫位是否包含指定的四化（化禄、化权、化科、化忌）
   *
   * @version v1.3.4
   *
   * @param palaceName 宫位名称
   * @param scope 指定获取哪个运限的宫位
   * @param horoscopeMutagen 运限四化
   * @returns {boolean} 是否含有运限四化
   */
  hasHoroscopeMutagen: (palaceName: PalaceName, scope: Scope, horoscopeMutagen: Mutagen) => boolean;
}

/**
 * 运限功能实现类
 * 实现IFunctionalHoroscope接口，提供运限数据的访问和分析功能
 */
export default class FunctionalHoroscope implements IFunctionalHoroscope {
  lunarDate;       // 农历日期
  solarDate;       // 阳历日期
  decadal;         // 大限信息
  age;             // 小限信息
  yearly;          // 流年信息
  monthly;         // 流月信息
  daily;           // 流日信息
  hourly;          // 流时信息
  astrolabe;       // 星盘对象

  /**
   * 构造函数
   * 初始化运限对象，设置基本属性
   * 
   * @param data 运限数据
   * @param astrolabe 星盘对象
   */
  constructor(data: Horoscope, astrolabe: IFunctionalAstrolabe) {
    this.lunarDate = data.lunarDate;
    this.solarDate = data.solarDate;
    this.decadal = data.decadal;
    this.age = data.age;
    this.yearly = data.yearly;
    this.monthly = data.monthly;
    this.daily = data.daily;
    this.hourly = data.hourly;
    this.astrolabe = astrolabe;

    return this;
  }

  /**
   * 获取小限宫位
   * 返回当前小限对应的宫位
   * 
   * @returns 小限宫位对象
   */
  agePalace = () => {
    return this.astrolabe.palace(this.age.index);
  };

  /**
   * 获取运限宫位
   * 根据宫位名称和运限范围获取对应的宫位
   * 
   * @param palaceName 宫位名称
   * @param scope 运限范围
   * @returns 宫位对象
   */
  palace = (palaceName: PalaceName, scope: Scope) => {
    // 如果是原命盘，直接从星盘中获取宫位
    if (scope === 'origin') {
      return this.astrolabe.palace(palaceName);
    }

    // 获取目标宫位索引
    const targetPalaceindex = this[scope].palaceNames.indexOf(palaceName);

    // 根据索引获取宫位
    return this.astrolabe.palace(targetPalaceindex);
  };

  /**
   * 获取运限指定宫位的三方四正宫位
   * 返回特定运限中指定宫位的三方四正关系
   * 
   * @param palaceName 宫位名称
   * @param scope 运限范围
   * @returns 三方四正宫位对象
   */
  surroundPalaces = (palaceName: PalaceName, scope: Scope) => {
    // 如果是原命盘，直接从星盘中获取三方四正
    if (scope === 'origin') {
      return this.astrolabe.surroundedPalaces(palaceName);
    }

    // 获取目标宫位索引
    const targetPalaceindex = this[scope].palaceNames.indexOf(palaceName);

    // 根据索引获取三方四正
    return this.astrolabe.surroundedPalaces(targetPalaceindex);
  };

  /**
   * 判断在指定运限的宫位内是否包含流耀，需要全部包含才返回true
   * 检查特定宫位是否包含所有指定的流耀星
   * 
   * @param palaceName 宫位名称
   * @param scope 运限范围
   * @param horoscopeStar 流耀星数组
   * @returns 是否包含所有指定流耀
   */
  hasHoroscopeStars = (palaceName: PalaceName, scope: Scope, horoscopeStar: StarName[]) => {
    // 检查是否有大限和流年星耀数据
    if (!this.decadal.stars || !this.yearly.stars) {
      return false;
    }

    // 获取宫位索引
    const palaceIndex = _getHoroscopePalaceIndex(this, scope, palaceName);
    // 合并大限和流年星耀
    const stars = mergeStars(this.decadal.stars, this.yearly.stars)[palaceIndex];
    // 获取星耀键名
    const starKeys = stars.map((item) => kot<StarKey>(item.name));
    // 获取流耀星键名
    const horoscopeStarKeys = horoscopeStar.map((item) => kot<StarKey>(item));

    // 检查是否包含所有指定流耀
    return horoscopeStarKeys.every((star) => starKeys.includes(star));
  };

  /**
   * 判断指定运限宫位内是否不含流耀，需要全部不包含才返回true
   * 检查特定宫位是否不包含任何指定的流耀星
   * 
   * @param palaceName 宫位名称
   * @param scope 运限范围
   * @param horoscopeStar 流耀星数组
   * @returns 是否不包含任何指定流耀
   */
  notHaveHoroscopeStars = (palaceName: PalaceName, scope: Scope, horoscopeStar: StarName[]) => {
    // 检查是否有大限和流年星耀数据
    if (!this.decadal.stars || !this.yearly.stars) {
      return false;
    }

    // 获取宫位索引
    const palaceIndex = _getHoroscopePalaceIndex(this, scope, palaceName);
    // 合并大限和流年星耀
    const stars = mergeStars(this.decadal.stars, this.yearly.stars)[palaceIndex];
    // 获取星耀键名
    const starKeys = stars.map((item) => kot<StarKey>(item.name));
    // 获取流耀星键名
    const horoscopeStarKeys = horoscopeStar.map((item) => kot<StarKey>(item));

    // 检查是否不包含任何指定流耀
    return horoscopeStarKeys.every((star) => !starKeys.includes(star));
  };

  /**
   * 判断指定运限宫位内是否含有指定流耀，只要包含其中一颗就返回true
   * 检查特定宫位是否包含至少一颗指定的流耀星
   * 
   * @param palaceName 宫位名称
   * @param scope 运限范围
   * @param horoscopeStar 流耀星数组
   * @returns 是否包含至少一颗指定流耀
   */
  hasOneOfHoroscopeStars = (palaceName: PalaceName, scope: Scope, horoscopeStar: StarName[]) => {
    // 检查是否有大限和流年星耀数据
    if (!this.decadal.stars || !this.yearly.stars) {
      return false;
    }

    // 获取宫位索引
    const palaceIndex = _getHoroscopePalaceIndex(this, scope, palaceName);
    // 合并大限和流年星耀
    const stars = mergeStars(this.decadal.stars, this.yearly.stars)[palaceIndex];
    // 获取星耀键名
    const starKeys = stars.map((item) => kot<StarKey>(item.name));
    // 获取流耀星键名
    const horoscopeStarKeys = horoscopeStar.map((item) => kot<StarKey>(item));

    // 检查是否包含至少一颗指定流耀
    return horoscopeStarKeys.some((star) => starKeys.includes(star));
  };

  /**
   * 判断指定运限宫位内是否存在运限四化
   * 检查特定宫位是否包含指定的四化（化禄、化权、化科、化忌）
   * 
   * @param palaceName 宫位名称
   * @param scope 运限范围
   * @param horoscopeMutagen 运限四化
   * @returns 是否包含指定四化
   */
  hasHoroscopeMutagen = (palaceName: PalaceName, scope: Scope, horoscopeMutagen: Mutagen) => {
    // 原命盘没有运限四化
    if (scope === 'origin') {
      return false;
    }

    // 获取宫位索引
    const palaceIndex = _getHoroscopePalaceIndex(this, scope, palaceName);
    // 获取主星和辅星
    const majorStars = this.astrolabe.palace(palaceIndex)?.majorStars ?? [];
    const minorStars = this.astrolabe.palace(palaceIndex)?.minorStars ?? [];
    // 合并星耀并获取星耀键名
    const stars = mergeStars([majorStars], [minorStars])[0].map((star) => kot<StarKey>(star.name));
    // 获取四化索引
    const mutagenIndex = MUTAGEN.indexOf(kot<MutagenKey>(horoscopeMutagen));

    // 检查是否包含指定四化
    return stars.includes(kot<StarKey>(this[scope].mutagen[mutagenIndex]));
  };
}
