import { getHeavenlyStemAndEarthlyBranchBySolarDate } from 'lunar-lite';
import {
  EARTHLY_BRANCHES,
  GENDER,
  HEAVENLY_STEMS,
  TIGER_RULE,
  earthlyBranches,
  FiveElementsClass,
} from '../data';
import { Decadal, AstrolabeParam } from '../data/types';
import {
  EarthlyBranchKey,
  FiveElementsClassKey,
  HeavenlyStemKey,
  HeavenlyStemName,
  GenderKey,
  kot,
  t,
} from '../i18n';
import { fixEarthlyBranchIndex, fixIndex, fixLunarMonthIndex, getAgeIndex } from '../utils';
import { getConfig } from './astro';
import { getFiveElementsClass, getSoulAndBody } from './palace';

/**
 * 时间周期计算器类
 * 专门处理时间周期计算的逻辑，包括大限、小限、年龄等时间相关计算
 * 在紫微斗数中，时间周期是命盘分析的重要依据
 */
export default class TimePeriodCalculator {
  /**
   * 起大限
   * 计算命盘的大限信息，大限是紫微斗数中重要的时间周期，每十年一个大限
   *
   * - 大限由命宫起，阳男阴女顺行；
   * - 阴男阳女逆行，每十年过一宫限。
   *
   * @param param 通用排盘参数
   * @returns 从寅宫开始的大限年龄段
   */
  static getHoroscope(param: AstrolabeParam): { decadals: Decadal[]; ages: number[][] } {
    const { solarDate, timeIndex, gender, from } = param;
    // 存储大限数据
    const decadals: Decadal[] = [];
    // 获取性别键
    const genderKey = kot<GenderKey>(gender!);
    // 获取年份的天干地支
    const { yearly } = getHeavenlyStemAndEarthlyBranchBySolarDate(solarDate, timeIndex, {
      // 起大限应该与配置同步
      year: getConfig().yearDivide,
    });
    // 获取天干地支键
    const heavenlyStem = kot<HeavenlyStemKey>(yearly[0], 'Heavenly');
    const earthlyBranch = kot<EarthlyBranchKey>(yearly[1], 'Earthly');
    // 获取命宫和身宫信息
    const { soulIndex, heavenlyStemOfSoul, earthlyBranchOfSoul } = getSoulAndBody(param);
    // 计算五行属性
    const fiveElementsClass = kot<FiveElementsClassKey>(
      getFiveElementsClass(from?.heavenlyStem ?? heavenlyStemOfSoul, from?.earthlyBranch ?? earthlyBranchOfSoul),
    );

    // 用五虎遁获取大限起始天干
    const startHeavenlyStem = TIGER_RULE[heavenlyStem];

    // 计算12个宫位的大限信息
    for (let i = 0; i < 12; i++) {
      // 根据性别和阴阳确定顺逆行
      const idx =
        GENDER[genderKey] === earthlyBranches[earthlyBranch].yinYang ? fixIndex(soulIndex + i) : fixIndex(soulIndex - i);
      // 计算起始年龄
      const start = FiveElementsClass[fiveElementsClass] + 10 * i;
      // 计算天干索引
      const heavenlyStemIndex = fixIndex(HEAVENLY_STEMS.indexOf(startHeavenlyStem) + idx, 10);
      // 计算地支索引
      const earthlyBranchIndex = fixIndex(EARTHLY_BRANCHES.indexOf('yinEarthly') + idx);

      // 保存大限数据
      decadals[idx] = {
        range: [start, start + 9],       // 年龄范围
        heavenlyStem: t(HEAVENLY_STEMS[heavenlyStemIndex]),    // 天干
        earthlyBranch: t(EARTHLY_BRANCHES[earthlyBranchIndex]), // 地支
      };
    }

    // 计算小限索引
    const ageIdx = getAgeIndex(yearly[1]);
    const ages: number[][] = [];

    // 计算12个宫位的小限年龄
    for (let i = 0; i < 12; i++) {
      const age: number[] = [];

      // 每个宫位有10个年龄
      for (let j = 0; j < 10; j++) {
        age.push(12 * j + i + 1);
      }

      // 根据性别确定顺逆行
      const idx = kot<GenderKey>(gender!) === 'male' ? fixIndex(ageIdx + i) : fixIndex(ageIdx - i);

      ages[idx] = age;
    }

    return { decadals, ages };
  }

  /**
   * 计算当前虚岁
   * 根据出生日期和目标日期计算虚岁，虚岁是紫微斗数中使用的年龄计算方式
   * 
   * @param birthYear 出生年份
   * @param targetYear 目标年份
   * @param birthMonth 出生月份
   * @param birthDay 出生日期
   * @param targetMonth 目标月份
   * @param targetDay 目标日期
   * @returns 虚岁
   */
  static calculateNominalAge(
    birthYear: number,
    targetYear: number,
    birthMonth: number = 1,
    birthDay: number = 1,
    targetMonth: number = 1,
    targetDay: number = 1
  ): number {
    // 基础虚岁计算
    let nominalAge = targetYear - birthYear;
    
    // 根据配置决定是否需要按生日调整
    if (getConfig().ageDivide === 'birthday') {
      // 如果目标日期在生日前，虚岁减1
      if (targetMonth < birthMonth || (targetMonth === birthMonth && targetDay < birthDay)) {
        nominalAge -= 1;
      }
    }
    
    return nominalAge;
  }

  /**
   * 获取指定年龄所在的大限
   * 根据年龄查找对应的大限索引，用于确定当前所处的大限
   * 
   * @param decadals 大限数组
   * @param age 年龄（虚岁）
   * @returns 大限索引，如果未找到返回-1
   */
  static getDecadalIndexByAge(decadals: Decadal[], age: number): number {
    // 遍历所有大限，查找包含指定年龄的大限
    for (let i = 0; i < decadals.length; i++) {
      if (age >= decadals[i].range[0] && age <= decadals[i].range[1]) {
        return i;
      }
    }
    // 如果未找到，返回-1
    return -1;
  }
}