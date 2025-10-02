import { getHeavenlyStemAndEarthlyBranchBySolarDate } from 'lunar-lite';
import { initStars } from '.';
import { t } from '../i18n';
import { fixLunarMonthIndex, getBrightness, getMutagen } from '../utils';
import FunctionalStar from './FunctionalStar';
import {
  getChangQuIndex,
  getHuoLingIndexFP,
  getKongJieIndex,
  getKuiYueIndexFP,
  getLuYangTuoMaIndexFP,
  getZuoYouIndex,
} from './location';
import { getConfig } from '../astro';

/**
 * 安14辅星，寅宫下标为0，若下标对应的数组为空数组则表示没有星耀
 *
 * @param solarDateStr 阳历日期字符串
 * @param timeIndex 时辰索引【0～12】
 * @param fixLeap 是否修复闰月，假如当月不是闰月则不生效
 * @returns 14辅星
 */
export const getMinorStar = (solarDateStr: string, timeIndex: number, fixLeap?: boolean) => {
  const stars = initStars();
  const { yearly } = getHeavenlyStemAndEarthlyBranchBySolarDate(solarDateStr, timeIndex, {
    year: getConfig().yearDivide,
  });
  const monthIndex = fixLunarMonthIndex(solarDateStr, timeIndex, fixLeap);

  // 此处获取到的是索引，下标是从0开始的，所以需要加1
  const { zuoIndex, youIndex } = getZuoYouIndex(monthIndex + 1);
  const { changIndex, quIndex } = getChangQuIndex(timeIndex);
  const { kuiIndex, yueIndex } = getKuiYueIndexFP(yearly[0] as any);
  const { huoIndex, lingIndex } = getHuoLingIndexFP(yearly[1] as any, timeIndex);
  const { kongIndex, jieIndex } = getKongJieIndex(timeIndex);
  const { luIndex, yangIndex, tuoIndex, maIndex } = getLuYangTuoMaIndexFP(yearly[0] as any, yearly[1] as any);

  stars[zuoIndex].push(
    new FunctionalStar({
      key: 'zuofuMin',
      name: t('zuofuMin'),
      type: 'soft',
      scope: 'origin',
      brightness: getBrightness('左辅', zuoIndex),
      mutagen: getMutagen('左辅', yearly[0]),
    }),
  );
  stars[youIndex].push(
    new FunctionalStar({
      key: 'youbiMin',
      name: t('youbiMin'),
      type: 'soft',
      scope: 'origin',
      brightness: getBrightness('右弼', youIndex),
      mutagen: getMutagen('右弼', yearly[0]),
    }),
  );
  stars[changIndex].push(
    new FunctionalStar({
      key: 'wenchangMin',
      name: t('wenchangMin'),
      type: 'soft',
      scope: 'origin',
      brightness: getBrightness('文昌', changIndex),
      mutagen: getMutagen('文昌', yearly[0]),
    }),
  );
  stars[quIndex].push(
    new FunctionalStar({
      key: 'wenquMin',
      name: t('wenquMin'),
      type: 'soft',
      scope: 'origin',
      brightness: getBrightness('文曲', quIndex),
      mutagen: getMutagen('文曲', yearly[0]),
    }),
  );
  stars[kuiIndex].push(
    new FunctionalStar({
      key: 'tiankuiMin',
      name: t('tiankuiMin'),
      type: 'soft',
      scope: 'origin',
      brightness: getBrightness('天魁', kuiIndex),
    }),
  );
  stars[yueIndex].push(
    new FunctionalStar({
      key: 'tianyueMin',
      name: t('tianyueMin'),
      type: 'soft',
      scope: 'origin',
      brightness: getBrightness('天钺', yueIndex),
    }),
  );
  stars[luIndex].push(
    new FunctionalStar({
      key: 'lucunMin',
      name: t('lucunMin'),
      type: 'lucun',
      scope: 'origin',
      brightness: getBrightness('禄存', luIndex),
    }),
  );
  stars[maIndex].push(
    new FunctionalStar({
      key: 'tianmaMin',
      name: t('tianmaMin'),
      type: 'tianma',
      scope: 'origin',
      brightness: getBrightness('天马', maIndex),
    }),
  );
  stars[kongIndex].push(
    new FunctionalStar({
      key: 'dikongMin',
      name: t('dikongMin'),
      type: 'tough',
      scope: 'origin',
      brightness: getBrightness('地空', kongIndex),
    }),
  );
  stars[jieIndex].push(
    new FunctionalStar({
      key: 'dijieMin',
      name: t('dijieMin'),
      type: 'tough',
      scope: 'origin',
      brightness: getBrightness('地劫', jieIndex),
    }),
  );
  stars[huoIndex].push(
    new FunctionalStar({
      key: 'huoxingMin',
      name: t('huoxingMin'),
      type: 'tough',
      scope: 'origin',
      brightness: getBrightness('火星', huoIndex),
    }),
  );
  stars[lingIndex].push(
    new FunctionalStar({
      key: 'lingxingMin',
      name: t('lingxingMin'),
      type: 'tough',
      scope: 'origin',
      brightness: getBrightness('铃星', lingIndex),
    }),
  );
  stars[yangIndex].push(
    new FunctionalStar({
      key: 'qingyangMin',
      name: t('qingyangMin'),
      type: 'tough',
      scope: 'origin',
      brightness: getBrightness('擎羊', yangIndex),
    }),
  );
  stars[tuoIndex].push(
    new FunctionalStar({
      key: 'tuoluoMin',
      name: t('tuoluoMin'),
      type: 'tough',
      scope: 'origin',
      brightness: getBrightness('陀罗', tuoIndex),
    }),
  );

  return stars;
};
