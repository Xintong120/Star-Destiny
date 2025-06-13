import { getHeavenlyStemAndEarthlyBranchBySolarDate } from 'lunar-lite';
import { getYearly12, initStars } from '.';
import { kot, t } from '../i18n';
import FunctionalStar from './FunctionalStar';
import {
  getDailyStarIndex,
  getLuanXiIndex,
  getMonthlyStarIndex,
  getTimelyStarIndex,
  getYearlyStarIndex,
} from './location';
import { getConfig } from '../astro';
import { AstrolabeParam } from '../data/types';

/**
 * 安杂耀
 *
 * @param {AstrolabeParam} param - 通用排盘参数参数
 * @returns 38杂耀
 */
export const getAdjectiveStar = (param: AstrolabeParam) => {
  const { solarDate, timeIndex, fixLeap } = param;
  const { algorithm } = getConfig();
  const stars = initStars();
  const { yearly } = getHeavenlyStemAndEarthlyBranchBySolarDate(solarDate, timeIndex, {
    year: getConfig().yearDivide,
  });

  const yearlyIndex = getYearlyStarIndex(param);
  const monthlyIndex = getMonthlyStarIndex(solarDate, timeIndex, fixLeap);
  const dailyIndex = getDailyStarIndex(solarDate, timeIndex, fixLeap);
  const timelyIndex = getTimelyStarIndex(timeIndex);
  const { hongluanIndex, tianxiIndex } = getLuanXiIndex(yearly[1]);
  const { suiqian12 } = getYearly12(solarDate);

  stars[hongluanIndex].push(new FunctionalStar({ key: 'hongluan', name: t('hongluan'), type: 'flower', scope: 'origin' }));
  stars[tianxiIndex].push(new FunctionalStar({ key: 'tianxi', name: t('tianxi'), type: 'flower', scope: 'origin' }));
  stars[monthlyIndex.tianyaoIndex].push(new FunctionalStar({ key: 'tianyao', name: t('tianyao'), type: 'flower', scope: 'origin' }));
  stars[yearlyIndex.xianchiIndex].push(new FunctionalStar({ key: 'xianchi', name: t('xianchi'), type: 'flower', scope: 'origin' }));
  stars[monthlyIndex.yuejieIndex].push(new FunctionalStar({ key: 'jieshen', name: t('jieshen'), type: 'helper', scope: 'origin' }));
  stars[dailyIndex.santaiIndex].push(new FunctionalStar({ key: 'santai', name: t('santai'), type: 'adjective', scope: 'origin' }));
  stars[dailyIndex.bazuoIndex].push(new FunctionalStar({ key: 'bazuo', name: t('bazuo'), type: 'adjective', scope: 'origin' }));
  stars[dailyIndex.enguangIndex].push(new FunctionalStar({ key: 'engguang', name: t('engguang'), type: 'adjective', scope: 'origin' }));
  stars[dailyIndex.tianguiIndex].push(new FunctionalStar({ key: 'tiangui', name: t('tiangui'), type: 'adjective', scope: 'origin' }));
  stars[yearlyIndex.longchiIndex].push(new FunctionalStar({ key: 'longchi', name: t('longchi'), type: 'adjective', scope: 'origin' }));
  stars[yearlyIndex.fenggeIndex].push(new FunctionalStar({ key: 'fengge', name: t('fengge'), type: 'adjective', scope: 'origin' }));
  stars[yearlyIndex.tiancaiIndex].push(new FunctionalStar({ key: 'tiancai', name: t('tiancai'), type: 'adjective', scope: 'origin' }));
  stars[yearlyIndex.tianshouIndex].push(
    new FunctionalStar({ key: 'tianshou', name: t('tianshou'), type: 'adjective', scope: 'origin' }),
  );
  stars[timelyIndex.taifuIndex].push(new FunctionalStar({ key: 'taifu', name: t('taifu'), type: 'adjective', scope: 'origin' }));
  stars[timelyIndex.fenggaoIndex].push(new FunctionalStar({ key: 'fenggao', name: t('fenggao'), type: 'adjective', scope: 'origin' }));
  stars[monthlyIndex.tianwuIndex].push(new FunctionalStar({ key: 'tianwu', name: t('tianwu'), type: 'adjective', scope: 'origin' }));
  stars[yearlyIndex.huagaiIndex].push(new FunctionalStar({ key: 'huagai', name: t('huagai'), type: 'adjective', scope: 'origin' }));
  stars[yearlyIndex.tianguanIndex].push(
    new FunctionalStar({ key: 'tianguan', name: t('tianguan'), type: 'adjective', scope: 'origin' }),
  );
  stars[yearlyIndex.tianfuIndex].push(new FunctionalStar({ key: 'tianfu', name: t('tianfu'), type: 'adjective', scope: 'origin' }));
  stars[yearlyIndex.tianchuIndex].push(new FunctionalStar({ key: 'tianchu', name: t('tianchu'), type: 'adjective', scope: 'origin' }));
  stars[monthlyIndex.tianyueIndex].push(new FunctionalStar({ key: 'tianyue', name: t('tianyue'), type: 'adjective', scope: 'origin' }));
  stars[yearlyIndex.tiandeIndex].push(new FunctionalStar({ key: 'tiande', name: t('tiande'), type: 'adjective', scope: 'origin' }));
  stars[yearlyIndex.yuedeIndex].push(new FunctionalStar({ key: 'yuede', name: t('yuede'), type: 'adjective', scope: 'origin' }));
  stars[yearlyIndex.tiankongIndex].push(
    new FunctionalStar({ key: 'tiankong', name: t('tiankong'), type: 'adjective', scope: 'origin' }),
  );
  stars[yearlyIndex.xunkongIndex].push(new FunctionalStar({ key: 'xunkong', name: t('xunkong'), type: 'adjective', scope: 'origin' }));

  if (algorithm !== 'zhongzhou') {
    // 中州派没有的星耀
    stars[yearlyIndex.jieluIndex].push(new FunctionalStar({ key: 'jielu', name: t('jielu'), type: 'adjective', scope: 'origin' }));
    stars[yearlyIndex.kongwangIndex].push(
      new FunctionalStar({ key: 'kongwang', name: t('kongwang'), type: 'adjective', scope: 'origin' }),
    );
  } else {
    // 中州派特有的星耀
    stars[suiqian12.indexOf(t(kot('longde')))].push(
      new FunctionalStar({ key: 'longde', name: t('longde'), type: 'adjective', scope: 'origin' }),
    );
    stars[yearlyIndex.jiekongIndex].push(
      new FunctionalStar({ key: 'jiekong', name: t('jiekong'), type: 'adjective', scope: 'origin' }),
    );
    stars[yearlyIndex.jieshaAdjIndex].push(
      new FunctionalStar({ key: 'jieshaAdj', name: t('jieshaAdj'), type: 'adjective', scope: 'origin' }),
    );
    stars[yearlyIndex.dahaoAdjIndex].push(new FunctionalStar({ key: 'dahao', name: t('dahao'), type: 'adjective', scope: 'origin' }));
  }

  stars[yearlyIndex.guchenIndex].push(new FunctionalStar({ key: 'guchen', name: t('guchen'), type: 'adjective', scope: 'origin' }));
  stars[yearlyIndex.guasuIndex].push(new FunctionalStar({ key: 'guasu', name: t('guasu'), type: 'adjective', scope: 'origin' }));
  stars[yearlyIndex.feilianIndex].push(new FunctionalStar({ key: 'feilian', name: t('feilian'), type: 'adjective', scope: 'origin' }));
  stars[yearlyIndex.posuiIndex].push(new FunctionalStar({ key: 'posui', name: t('posui'), type: 'adjective', scope: 'origin' }));
  stars[monthlyIndex.tianxingIndex].push(
    new FunctionalStar({ key: 'tianxing', name: t('tianxing'), type: 'adjective', scope: 'origin' }),
  );
  stars[monthlyIndex.yinshaIndex].push(new FunctionalStar({ key: 'yinsha', name: t('yinsha'), type: 'adjective', scope: 'origin' }));
  stars[yearlyIndex.tiankuIndex].push(new FunctionalStar({ key: 'tianku', name: t('tianku'), type: 'adjective', scope: 'origin' }));
  stars[yearlyIndex.tianxuIndex].push(new FunctionalStar({ key: 'tianxu', name: t('tianxu'), type: 'adjective', scope: 'origin' }));
  stars[yearlyIndex.tianshiIndex].push(new FunctionalStar({ key: 'tianshi', name: t('tianshi'), type: 'adjective', scope: 'origin' }));
  stars[yearlyIndex.tianshangIndex].push(
    new FunctionalStar({ key: 'tianshang', name: t('tianshang'), type: 'adjective', scope: 'origin' }),
  );

  // 生年年解
  stars[yearlyIndex.nianjieIndex].push(new FunctionalStar({ key: 'nianjie', name: t('nianjie'), type: 'helper', scope: 'origin' }));

  return stars;
};
