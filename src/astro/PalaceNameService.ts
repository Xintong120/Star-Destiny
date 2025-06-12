import { PalaceName, kot, t } from '../i18n';
import { fixEarthlyBranchIndex, fixIndex } from '../utils';
import { IFunctionalAstrolabe } from './FunctionalAstrolabe';
import { IFunctionalPalace } from './FunctionalPalace';
import { FunctionalSurpalaces, IFunctionalSurpalaces } from './FunctionalSurpalaces';
import { PALACES } from '../data';

/**
 * 宫位服务
 * 负责处理与宫位获取、分析及名称计算相关的所有逻辑
 */
export class PalaceNameService {
  /**
   * 获取星盘的某一个宫位
   *
   * @param astrolabe 星盘实例
   * @param indexOrName 宫位索引或者宫位名称
   * @returns {IFunctionalPalace | undefined} 对应的宫位实例，若未找到则返回 undefined
   */
  public static getPalace(
    astrolabe: IFunctionalAstrolabe,
    indexOrName: number | PalaceName,
  ): IFunctionalPalace | undefined {
    let palace: IFunctionalPalace | undefined;

    if (typeof indexOrName === 'number') {
      if (indexOrName < 0 || indexOrName > 11) {
        throw new Error('无效的宫位索引，合法的索引范围是 0-11。');
      }
      palace = astrolabe.palaces[indexOrName];
    } else {
      palace = astrolabe.palaces.find((item) => {
        // anaylzer.ts 中有拼写错误，isOriginalPalace -> isPrimaryPalace
        // @ts-ignore
        if (kot<PalaceName>(indexOrName) === '命宫' && item.isPrimaryPalace) {
          return true;
        }
        if (kot<PalaceName>(indexOrName) === '身宫' && item.isBodyPalace) {
          return true;
        }
        return kot<PalaceName>(item.name) === kot<PalaceName>(indexOrName);
      });
    }

    palace?.setAstrolabe(astrolabe);

    return palace;
  }

  /**
   * 获取三方四正宫位
   * 三方四正是指目标宫位、其对宫、财帛位和官禄位
   *
   * @param astrolabe 星盘实例
   * @param indexOrName 目标宫位的索引或者宫位名称
   * @returns {IFunctionalSurpalaces} 三方四正宫位对象
   */
  public static getSurroundedPalaces(
    astrolabe: IFunctionalAstrolabe,
    indexOrName: number | PalaceName,
  ): IFunctionalSurpalaces {
    const palace = this.getPalace(astrolabe, indexOrName);

    if (!palace) {
      throw new Error('无效的宫位索引或名称。');
    }

    const palaceIndex = fixEarthlyBranchIndex(palace.earthlyBranch);
    // 对宫索引：目标宫位索引 + 6
    const oppositePalace = this.getPalace(astrolabe, fixIndex(palaceIndex + 6));
    // 财帛位索引：目标宫位索引 + 8 (顺时针)
    const wealthPalace = this.getPalace(astrolabe, fixIndex(palaceIndex + 8));
    // 官禄位索引：目标宫位索引 + 4 (顺时针)
    const careerPalace = this.getPalace(astrolabe, fixIndex(palaceIndex + 4));

    if (!oppositePalace || !wealthPalace || !careerPalace) {
      throw new Error('无法计算三方四正宫位，可能是星盘数据不完整。');
    }

    return new FunctionalSurpalaces({
      target: palace,
      opposite: oppositePalace,
      wealth: wealthPalace,
      career: careerPalace,
    });
  }

  /**
   * 获取十二宫的名称数组
   *
   * @returns {PalaceName[]} 十二宫名称数组
   */
  public static getPalaceNames(): PalaceName[] {
    return PALACES.map((p) => t(p as PalaceName));
  }

  /**
   * 获取运限十二宫的名称
   *
   * @param startIndex 起始宫位的索引
   * @param isClockwise 是否顺时针。默认为 false
   * @returns {PalaceName[]} 运限十二宫名称数组
   */
  public static getHoroscopePalaceNames(startIndex: number, isClockwise: boolean = false): PalaceName[] {
    const palaceNames = this.getPalaceNames();
    const result: PalaceName[] = [];

    for (let i = 0; i < 12; i++) {
      const index = fixIndex(isClockwise ? startIndex - i : startIndex + i);
      result.push(palaceNames[index]);
    }
    return result;
  }
}