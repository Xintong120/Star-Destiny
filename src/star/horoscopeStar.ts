import { initStars } from '.';
import { Scope } from '../data/types';
import { t, HeavenlyStemName, EarthlyBranchName, StarName, StarKey } from '../i18n';
import FunctionalStar from './FunctionalStar';
import {
  getChangQuIndexByHeavenlyStem,
  getKuiYueIndex,
  getLuanXiIndex,
  getLuYangTuoMaIndex,
  getNianjieIndex,
} from './location';

/**
 * 获取流耀
 *
 * 魁钺昌曲禄羊陀马鸾喜
 *
 * @param heavenlyStem 天干
 * @param earthlyBranch 地支
 */
export const getHoroscopeStar = (
  heavenlyStem: HeavenlyStemName,
  earthlyBranch: EarthlyBranchName,
  scope: Scope,
): FunctionalStar[][] => {
  const { kuiIndex, yueIndex } = getKuiYueIndex(heavenlyStem);
  const { changIndex, quIndex } = getChangQuIndexByHeavenlyStem(heavenlyStem);
  const { luIndex, yangIndex, tuoIndex, maIndex } = getLuYangTuoMaIndex(heavenlyStem, earthlyBranch);
  const { hongluanIndex, tianxiIndex } = getLuanXiIndex(earthlyBranch);
  const stars = initStars();

  const trans: Record<
    Scope,
    Record<
      'tiankui' | 'tianyue' | 'wenchang' | 'wenqu' | 'lucun' | 'qingyang' | 'tuoluo' | 'tianma' | 'hongluan' | 'tianxi',
      { key: StarKey; name: StarName }
    >
  > = {
    origin: {
      tiankui: { key: 'tiankuiMin', name: t('tiankuiMin') },
      tianyue: { key: 'tianyueMin', name: t('tianyueMin') },
      wenchang: { key: 'wenchangMin', name: t('wenchangMin') },
      wenqu: { key: 'wenquMin', name: t('wenquMin') },
      lucun: { key: 'lucunMin', name: t('lucunMin') },
      qingyang: { key: 'qingyangMin', name: t('qingyangMin') },
      tuoluo: { key: 'tuoluoMin', name: t('tuoluoMin') },
      tianma: { key: 'tianmaMin', name: t('tianmaMin') },
      hongluan: { key: 'hongluan', name: t('hongluan') },
      tianxi: { key: 'tianxi', name: t('tianxi') },
    },
    decadal: {
      tiankui: { key: 'yunkui', name: t('yunkui') },
      tianyue: { key: 'yunyue', name: t('yunyue') },
      wenchang: { key: 'yunchang', name: t('yunchang') },
      wenqu: { key: 'yunqu', name: t('yunqu') },
      lucun: { key: 'yunlu', name: t('yunlu') },
      qingyang: { key: 'yunyang', name: t('yunyang') },
      tuoluo: { key: 'yuntuo', name: t('yuntuo') },
      tianma: { key: 'yunma', name: t('yunma') },
      hongluan: { key: 'yunluan', name: t('yunluan') },
      tianxi: { key: 'yunxi', name: t('yunxi') },
    },
    yearly: {
      tiankui: { key: 'liukui', name: t('liukui') },
      tianyue: { key: 'liuyue', name: t('liuyue') },
      wenchang: { key: 'liuchang', name: t('liuchang') },
      wenqu: { key: 'liuqu', name: t('liuqu') },
      lucun: { key: 'liulu', name: t('liulu') },
      qingyang: { key: 'liuyang', name: t('liuyang') },
      tuoluo: { key: 'liutuo', name: t('liutuo') },
      tianma: { key: 'liuma', name: t('liuma') },
      hongluan: { key: 'liuluan', name: t('liuluan') },
      tianxi: { key: 'liuxi', name: t('liuxi') },
    },
    monthly: {
      tiankui: { key: 'yuekui', name: t('yuekui') },
      tianyue: { key: 'yueyue', name: t('yueyue') },
      wenchang: { key: 'yuechang', name: t('yuechang') },
      wenqu: { key: 'yuequ', name: t('yuequ') },
      lucun: { key: 'yuelu', name: t('yuelu') },
      qingyang: { key: 'yueyang', name: t('yueyang') },
      tuoluo: { key: 'yuetuo', name: t('yuetuo') },
      tianma: { key: 'yuema', name: t('yuema') },
      hongluan: { key: 'yueluan', name: t('yueluan') },
      tianxi: { key: 'yuexi', name: t('yuexi') },
    },
    daily: {
      tiankui: { key: 'rikui', name: t('rikui') },
      tianyue: { key: 'riyue', name: t('riyue') },
      wenchang: { key: 'richang', name: t('richang') },
      wenqu: { key: 'riqu', name: t('riqu') },
      lucun: { key: 'rilu', name: t('rilu') },
      qingyang: { key: 'riyang', name: t('riyang') },
      tuoluo: { key: 'rituo', name: t('rituo') },
      tianma: { key: 'rima', name: t('rima') },
      hongluan: { key: 'riluan', name: t('riluan') },
      tianxi: { key: 'rixi', name: t('rixi') },
    },
    hourly: {
      tiankui: { key: 'shikui', name: t('shikui') },
      tianyue: { key: 'shiyue', name: t('shiyue') },
      wenchang: { key: 'shichang', name: t('shichang') },
      wenqu: { key: 'shiqu', name: t('shiqu') },
      lucun: { key: 'shilu', name: t('shilu') },
      qingyang: { key: 'shiyang', name: t('shiyang') },
      tuoluo: { key: 'shituo', name: t('shituo') },
      tianma: { key: 'shima', name: t('shima') },
      hongluan: { key: 'shiluan', name: t('shiluan') },
      tianxi: { key: 'shixi', name: t('shixi') },
    },
  };

  if (scope === 'yearly') {
    const nianjieIndex = getNianjieIndex(earthlyBranch);

    stars[nianjieIndex].push(new FunctionalStar({ key: 'nianjie', name: t('nianjie'), type: 'helper', scope: 'yearly' }));
  }

  stars[kuiIndex].push(new FunctionalStar({ ...trans[scope].tiankui, type: 'soft', scope }));
  stars[yueIndex].push(new FunctionalStar({ ...trans[scope].tianyue, type: 'soft', scope }));
  stars[changIndex].push(new FunctionalStar({ ...trans[scope].wenchang, type: 'soft', scope }));
  stars[quIndex].push(new FunctionalStar({ ...trans[scope].wenqu, type: 'soft', scope }));
  stars[luIndex].push(new FunctionalStar({ ...trans[scope].lucun, type: 'lucun', scope }));
  stars[yangIndex].push(new FunctionalStar({ ...trans[scope].qingyang, type: 'tough', scope }));
  stars[tuoIndex].push(new FunctionalStar({ ...trans[scope].tuoluo, type: 'tough', scope }));
  stars[maIndex].push(new FunctionalStar({ ...trans[scope].tianma, type: 'tianma', scope }));
  stars[hongluanIndex].push(new FunctionalStar({ ...trans[scope].hongluan, type: 'flower', scope }));
  stars[tianxiIndex].push(new FunctionalStar({ ...trans[scope].tianxi, type: 'flower', scope }));

  return stars;
};
