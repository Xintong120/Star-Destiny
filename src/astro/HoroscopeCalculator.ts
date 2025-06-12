import dayjs from 'dayjs';
import { getHeavenlyStemAndEarthlyBranchBySolarDate, normalizeDateStr, solar2lunar } from 'lunar-lite';
import { EARTHLY_BRANCHES } from '../data';
import { Horoscope } from '../data/types';
import { EarthlyBranchKey, EarthlyBranchName, HeavenlyStemName, kot, PalaceName, StarKey, StarName, t } from '../i18n';
import { getHoroscopeStar, getYearly12 } from '../star';
import { fixEarthlyBranchIndex, fixIndex, getMutagensByHeavenlyStem, timeToIndex } from '../utils';
import { IFunctionalAstrolabe } from './FunctionalAstrolabe';
import FunctionalHoroscope, { IFunctionalHoroscope } from './FunctionalHoroscope';
import { getConfig } from './astro';
import { PalaceNameService } from './PalaceNameService';

/**
 * 运限计算器类
 * 专门处理运限计算的逻辑
 */
export default class HoroscopeCalculator {
  /**
   * 获取运限数据
   * 根据星盘对象和目标日期计算运限信息
   *
   * @param astrolabe 星盘对象
   * @param targetDate 阳历日期【可选】，默认为调用时日期
   * @param timeIndex 时辰序号【可选】，若不传会返回 `targetDate` 中时间所在的时辰
   * @returns 运限数据
   */
  static calculateHoroscope(
    astrolabe: IFunctionalAstrolabe,
    targetDate: string | Date = new Date(),
    timeIndex?: number,
  ): IFunctionalHoroscope {
    // 转换生日为农历
    const _birthday = solar2lunar(astrolabe.solarDate);
    // 转换目标日期为农历
    const _date = solar2lunar(targetDate);
    // 将小时转换为时辰索引
    const convertTimeIndex = timeToIndex(dayjs(targetDate).hour());
    // 获取目标日期的天干地支信息
    const { yearly, monthly, daily, hourly } = getHeavenlyStemAndEarthlyBranchBySolarDate(
      targetDate,
      timeIndex || convertTimeIndex,
      {
        // 运限是以立春为界，但为了满足部分流派允许配置
        year: getConfig().horoscopeDivide,
      },
    );
    // 计算虚岁
    let nominalAge = _date.lunarYear - _birthday.lunarYear;
    // 是否童限
    let isChildhood = false;

    // 根据配置决定年龄计算方式
    if (getConfig().ageDivide === 'birthday') {
      // 假如目标日期已经过了生日，则需要加1岁
      // 比如 2022年九月初一 出生的人，在出生后虚岁为 1 岁
      // 但在 2023年九月初二 以后，虚岁则为 2 岁
      if (
        (_date.lunarYear === _birthday.lunarYear &&
          _date.lunarMonth === _birthday.lunarMonth &&
          _date.lunarDay > _birthday.lunarDay) ||
        _date.lunarMonth > _birthday.lunarMonth
      ) {
        nominalAge += 1;
      }
    } else {
      // 以自然年为界，直接加1岁
      nominalAge += 1;
    }

    // 大限索引
    let decadalIndex = -1;
    // 大限天干
    let heavenlyStemOfDecade: HeavenlyStemName = 'jia';
    // 大限地支
    let earthlyBranchOfDecade: EarthlyBranchKey = 'ziEarthly';
    // 小限索引
    let ageIndex = -1;
    // 流年索引
    const yearlyIndex = fixEarthlyBranchIndex(yearly[1]);
    // 流月索引
    let monthlyIndex = -1;
    // 流日索引
    let dailyIndex = -1;
    // 流时索引
    let hourlyIndex = -1;
    // 小限天干
    let heavenlyStemOfAge: HeavenlyStemName = 'jia';
    // 小限地支
    let earthlyBranchOfAge: EarthlyBranchKey = 'ziEarthly';

    // 查询大限索引 - 根据年龄查找对应的大限
    astrolabe.palaces.some(({ decadal }, index) => {
      if (nominalAge >= decadal.range[0] && nominalAge <= decadal.range[1]) {
        decadalIndex = index;
        heavenlyStemOfDecade = decadal.heavenlyStem;
        earthlyBranchOfDecade = kot<EarthlyBranchKey>(decadal.earthlyBranch, 'Earthly');

        return true;
      }
    });

    // 如果大限索引小于0则证明还没有开始起运
    if (decadalIndex < 0) {
      // 此时应该取小限运
      // 一命二财三疾厄	四岁夫妻五福德
      // 六岁事业为童限	专就宫垣视吉凶
      const palaces: PalaceName[] = [t('命宫'), t('财帛'), t('疾厄'), t('夫妻'), t('福德'), t('官禄')];
      const targetPalaceName = palaces[nominalAge - 1];
      const targetPalace = astrolabe.palace(targetPalaceName);

      if (targetPalace) {
        isChildhood = true;
        decadalIndex = targetPalace.index;
        heavenlyStemOfDecade = targetPalace.heavenlyStem;
        earthlyBranchOfDecade = kot<EarthlyBranchKey>(targetPalace.earthlyBranch, 'Earthly');
      }
    }

    // 查询小限索引 - 根据年龄查找对应的小限
    astrolabe.palaces.some(({ ages, heavenlyStem, earthlyBranch }, index) => {
      if (ages.includes(nominalAge)) {
        ageIndex = index;
        heavenlyStemOfAge = heavenlyStem;
        earthlyBranchOfAge = kot<EarthlyBranchKey>(earthlyBranch, 'Earthly');

        return true;
      }
    });

    // 获取流月索引
    // 流年地支逆数到生月所在宫位，再从该宫位顺数到生时，为正月所在宫位，之后每月一宫
    monthlyIndex = fixIndex(
      yearlyIndex -
        _birthday.lunarMonth +
        EARTHLY_BRANCHES.indexOf(kot<EarthlyBranchKey>(astrolabe.rawDates.chineseDate.hourly[1])) +
        _date.lunarMonth,
    );

    // 获取流日索引 - 流月索引加上日期减1
    dailyIndex = fixIndex(monthlyIndex + _date.lunarDay - 1);

    // 获取流时索引 - 流日索引加上时辰索引
    hourlyIndex = fixIndex(dailyIndex + EARTHLY_BRANCHES.indexOf(kot<EarthlyBranchKey>(hourly[1], 'Earthly')));

    // 构建运限数据对象
    const scope: Horoscope = {
      // 阳历日期
      solarDate: normalizeDateStr(targetDate).slice(0, 3).join('-'),
      // 农历日期
      lunarDate: _date.toString(true),
      // 大限信息
      decadal: {
        index: decadalIndex,
        name: isChildhood ? t('childhood') : t('decadal'),
        heavenlyStem: t(kot(heavenlyStemOfDecade, 'Heavenly')),
        earthlyBranch: t(kot(earthlyBranchOfDecade, 'Earthly')),
        palaceNames: PalaceNameService.getHoroscopePalaceNames(decadalIndex, true),
        mutagen: getMutagensByHeavenlyStem(heavenlyStemOfDecade),
        stars: getHoroscopeStar(heavenlyStemOfDecade, kot<string>(earthlyBranchOfDecade) as EarthlyBranchName, 'decadal'),
      },
      // 小限信息
      age: {
        index: ageIndex,
        nominalAge,
        name: t('turn'),
        heavenlyStem: heavenlyStemOfAge,
        earthlyBranch: t(kot(earthlyBranchOfAge, 'Earthly')),
        palaceNames: PalaceNameService.getHoroscopePalaceNames(ageIndex),
        mutagen: getMutagensByHeavenlyStem(heavenlyStemOfAge),
      },
      // 流年信息
      yearly: {
        index: yearlyIndex,
        name: t('yearly'),
        heavenlyStem: t(kot(yearly[0], 'Heavenly')),
        earthlyBranch: t(kot(yearly[1], 'Earthly')),
        palaceNames: PalaceNameService.getHoroscopePalaceNames(yearlyIndex),
        mutagen: getMutagensByHeavenlyStem(yearly[0]),
        stars: getHoroscopeStar(yearly[0], yearly[1], 'yearly'),
        yearlyDecStar: getYearly12(targetDate),
      },
      // 流月信息
      monthly: {
        index: monthlyIndex,
        name: t('monthly'),
        heavenlyStem: t(kot(monthly[0], 'Heavenly')),
        earthlyBranch: t(kot(monthly[1], 'Earthly')),
        palaceNames: PalaceNameService.getHoroscopePalaceNames(monthlyIndex),
        mutagen: getMutagensByHeavenlyStem(monthly[0]),
        stars: getHoroscopeStar(monthly[0], monthly[1], 'monthly'),
      },
      // 流日信息
      daily: {
        index: dailyIndex,
        name: t('daily'),
        heavenlyStem: t(kot(daily[0], 'Heavenly')),
        earthlyBranch: t(kot(daily[1], 'Earthly')),
        palaceNames: PalaceNameService.getHoroscopePalaceNames(dailyIndex),
        mutagen: getMutagensByHeavenlyStem(daily[0]),
        stars: getHoroscopeStar(daily[0], daily[1], 'daily'),
      },
      // 流时信息
      hourly: {
        index: hourlyIndex,
        name: t('hourly'),
        heavenlyStem: t(kot(hourly[0], 'Heavenly')),
        earthlyBranch: t(kot(hourly[1], 'Earthly')),
        palaceNames: PalaceNameService.getHoroscopePalaceNames(hourlyIndex),
        mutagen: getMutagensByHeavenlyStem(hourly[0]),
        stars: getHoroscopeStar(hourly[0], hourly[1], 'hourly'),
      },
    };

    // 返回运限对象实例
    return new FunctionalHoroscope(scope, astrolabe);
  }
}