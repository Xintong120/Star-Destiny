import { getHeavenlyStemAndEarthlyBranchBySolarDate } from 'lunar-lite';
import {
  HEAVENLY_STEMS,
  TIGER_RULE,
} from '../data';
import { SoulAndBody, AstrolabeParam } from '../data/types';
import {
  EarthlyBranchKey,
  EarthlyBranchName,
  FiveElementsClassKey,
  FiveElementsClassName,
  HeavenlyStemKey,
  HeavenlyStemName,
  kot,
  t,
} from '../i18n';
import { fixEarthlyBranchIndex, fixLunarMonthIndex } from '../utils';
import { getConfig } from './astro';
// 导入新的服务类
import { getHoroscope } from './TimePeriodCalculator';
import { getPalaceNames } from './PalaceNameService';

/**
 * 获取命宫以及身宫数据
 *
 * 1. 定寅首
 * - 甲己年生起丙寅，乙庚年生起戊寅，
 * - 丙辛年生起庚寅，丁壬年生起壬寅，
 * - 戊癸年生起甲寅。
 *
 * 2. 安命身宫诀
 * - 寅起正月，顺数至生月，逆数生时为命宫。
 * - 寅起正月，顺数至生月，顺数生时为身宫。
 *
 * @param {AstrolabeParam} param 通用排盘参数
 * @returns {SoulAndBody} 命宫和身宫数据
 */
export const getSoulAndBody = (param: AstrolabeParam): SoulAndBody => {
  const { solarDate, timeIndex, fixLeap, from } = param;
  const { yearly, hourly } = getHeavenlyStemAndEarthlyBranchBySolarDate(solarDate, timeIndex, {
    year: getConfig().yearDivide,
  });
  const earthlyBranchOfTime = kot<EarthlyBranchKey>(hourly[1], 'Earthly');
  const heavenlyStemOfYear = kot<HeavenlyStemKey>(yearly[0], 'Heavenly');

  // 紫微斗数以`寅`宫为第一个宫位
  const firstIndex = EARTHLY_BRANCHES.indexOf('yinEarthly');

  const monthIndex = fixLunarMonthIndex(solarDate, timeIndex, fixLeap);

  // 命宫索引，以寅宫为0，顺时针数到生月地支索引，再逆时针数到生时地支索引
  // 此处数到生月地支索引其实就是农历月份，所以不再计算生月地支索引
  let soulIndex = fixIndex(monthIndex - EARTHLY_BRANCHES.indexOf(earthlyBranchOfTime));

  // 身宫索引，以寅宫为0，顺时针数到生月地支索引，再顺时针数到生时地支索引
  // 与命宫索引一样，不再赘述
  let bodyIndex = fixIndex(monthIndex + EARTHLY_BRANCHES.indexOf(earthlyBranchOfTime));

  if (from?.heavenlyStem && from?.earthlyBranch) {
    // 以传入地支为命宫
    soulIndex = fixEarthlyBranchIndex(from.earthlyBranch);

    const bodyOffset = [0, 2, 4, 6, 8, 10, 0, 2, 4, 6, 8, 10, 0];

    bodyIndex = fixIndex(bodyOffset[timeIndex] + soulIndex);
  }

  // 用五虎遁取得寅宫的天干
  const startHevenlyStem = TIGER_RULE[heavenlyStemOfYear];

  // 获取命宫天干索引，起始天干索引加上命宫的索引即是
  // 天干循环数为10
  const heavenlyStemOfSoulIndex = fixIndex(HEAVENLY_STEMS.indexOf(startHevenlyStem) + soulIndex, 10);

  // 命宫的天干
  const heavenlyStemOfSoul = t<HeavenlyStemName>(HEAVENLY_STEMS[heavenlyStemOfSoulIndex]);

  // 命宫地支，命宫索引 + `寅`的索引（因为紫微斗数里寅宫是第一个宫位）
  const earthlyBranchOfSoul = t<EarthlyBranchName>(EARTHLY_BRANCHES[fixIndex(soulIndex + firstIndex)]);

  return {
    soulIndex,
    bodyIndex,
    heavenlyStemOfSoul,
    earthlyBranchOfSoul,
  };
};

/**
 * 定五行局法（以命宫天干地支而定）
 *
 * 纳音五行计算取数巧记口诀：
 *
 * - 甲乙丙丁一到五，子丑午未一来数，
 * - 寅卯申酉二上走，辰巳戌亥三为足。
 * - 干支相加多减五，五行木金水火土。
 *
 * 注解：
 *
 * 1、五行取数：木1 金2 水3 火4 土5
 *
 *  天干取数：
 *  - 甲乙 ——> 1
 *  - 丙丁 ——> 2
 *  - 戊己 ——> 3
 *  - 庚辛 ——> 4
 *  - 壬癸 ——> 5
 *
 *  地支取数：
 *  - 子午丑未 ——> 1
 *  - 寅申卯酉 ——> 2
 *  - 辰戌巳亥 ——> 3
 *
 * 2、计算方法：
 *
 *  干支数相加，超过5者减去5，以差论之。
 *  - 若差为1则五行属木
 *  - 若差为2则五行属金
 *  - 若差为3则五行属水
 *  - 若差为4则五行属火
 *  - 若差为5则五行属土
 *
 * 3、举例：
 *  - 丙子：丙2 子1=3 ——> 水 ——> 水二局
 *  - 辛未：辛4 未1=5 ——> 土 ——> 土五局
 *  - 庚申：庚4 申2=6 ——> 6-5=1 ——> 木 ——> 木三局
 *
 * @param heavenlyStemName 天干
 * @param earthlyBranchName 地支
 * @returns 水二局 ｜ 木三局 ｜ 金四局 ｜ 土五局 ｜ 火六局
 */
export const getFiveElementsClass = (
  heavenlyStemName: HeavenlyStemName,
  earthlyBranchName: EarthlyBranchName,
): FiveElementsClassName => {
  const fiveElementsTable: FiveElementsClassKey[] = ['wood3rd', 'metal4th', 'water2nd', 'fire6th', 'earth5th'];
  const heavenlyStem = kot<HeavenlyStemKey>(heavenlyStemName, 'Heavenly');
  const earthlyBranch = kot<EarthlyBranchKey>(earthlyBranchName, 'Earthly');

  const heavenlyStemNumber = Math.floor(HEAVENLY_STEMS.indexOf(heavenlyStem) / 2) + 1;
  const earthlyBranchNumber = Math.floor(fixIndex(EARTHLY_BRANCHES.indexOf(earthlyBranch), 6) / 2) + 1;
  let index = heavenlyStemNumber + earthlyBranchNumber;

  while (index > 5) {
    index -= 5;
  }

  return t<FiveElementsClassName>(fiveElementsTable[index - 1]);
};

// 这些函数已经移动到专门的服务类中
// 导出函数版本，方便直接调用，保持向后兼容
export { getPalaceNames } from './PalaceNameService';
export { getHoroscope } from './TimePeriodCalculator';
