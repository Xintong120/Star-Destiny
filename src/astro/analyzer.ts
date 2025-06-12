import { MUTAGEN } from '../data';
import { Star, SurroundedPalaces } from '../data/types';
import { HeavenlyStemName, kot, Mutagen, MutagenKey, PalaceKey, PalaceName, StarKey, StarName } from '../i18n';
import { fixEarthlyBranchIndex, fixIndex, getMutagensByHeavenlyStem } from '../utils';
import { IFunctionalAstrolabe } from './FunctionalAstrolabe';
import { IFunctionalPalace } from './FunctionalPalace';
import { FunctionalSurpalaces, IFunctionalSurpalaces } from './FunctionalSurpalaces';

const _concatStars = (...stars: Star[][]): StarKey[] =>
  Array.from(stars)
    .reduce((prev, next) => {
      return [...prev, ...next];
    }, [])
    .map((item) => kot<StarKey>(item.name));

const _includeAll = (allStarsInPalace: StarKey[], targetStars: StarName[]) => {
  const starKeys = targetStars.map((item) => kot<StarKey>(item));

  return starKeys.every((star) => allStarsInPalace.includes(star));
};

const _excludeAll = (allStarsInPalace: StarKey[], targetStars: StarName[]) => {
  const starKeys = targetStars.map((item) => kot<StarKey>(item));

  return starKeys.every((star) => !allStarsInPalace.includes(star));
};

const _includeOneOf = (allStarsInPalace: StarKey[], targetStars: StarName[]) => {
  const starKeys = targetStars.map((item) => kot<StarKey>(item));

  return starKeys.some((star) => allStarsInPalace.includes(star));
};

const _includeMutagen = (stars: Star[], mutagen: Mutagen) => {
  const mutagenKey = kot<MutagenKey>(mutagen);

  return stars.some((star) => star.mutagen && kot<MutagenKey>(star.mutagen) === mutagenKey);
};

const _getAllStarsInSurroundedPalaces = ({ target, opposite, wealth, career }: SurroundedPalaces) =>
  _concatStars(
    target.majorStars,
    target.minorStars,
    target.adjectiveStars,
    opposite.majorStars,
    opposite.minorStars,
    opposite.adjectiveStars,
    wealth.majorStars,
    wealth.minorStars,
    wealth.adjectiveStars,
    career.majorStars,
    career.minorStars,
    career.adjectiveStars,
  );

/**
 * 判断某个宫位内是否有传入的星耀，要所有星耀都在宫位内才会返回true
 *
 * @version v1.0.0
 *
 * @param $ 宫位实例
 * @param stars 星耀
 * @returns true | false
 */
export const hasStars = ($: IFunctionalPalace, stars: StarName[]): boolean => {
  const allStarsInPalace = _concatStars($.majorStars, $.minorStars, $.adjectiveStars);

  return _includeAll(allStarsInPalace, stars);
};

/**
 * 判断指定宫位内是否有生年四化
 *
 * @version v1.2.0
 *
 * @param $ 宫位实例
 * @param mutagen 四化名称【禄｜权｜科｜忌】
 * @returns true | false
 */
export const hasMutagenInPlace = ($: IFunctionalPalace, mutagen: Mutagen): boolean => {
  const allStarsInPalace = [...$.majorStars, ...$.minorStars];

  return _includeMutagen(allStarsInPalace, mutagen);
};

/**
 * 判断指定宫位内是否没有生年四化
 *
 * @version v1.2.0
 *
 * @param $ 宫位实例
 * @param mutagen 四化名称【禄｜权｜科｜忌】
 * @returns true | false
 */
export const notHaveMutagenInPalce = ($: IFunctionalPalace, mutagen: Mutagen): boolean => {
  return !hasMutagenInPlace($, mutagen);
};

/**
 * 判断某个宫位内是否有传入的星耀，要所有星耀都不在宫位内才会返回true
 *
 * @version v1.0.0
 *
 * @param $ 宫位实例
 * @param stars 星耀
 * @returns true | false
 */
export const notHaveStars = ($: IFunctionalPalace, stars: StarName[]): boolean => {
  const allStarsInPalace = _concatStars($.majorStars, $.minorStars, $.adjectiveStars);

  return _excludeAll(allStarsInPalace, stars);
};

/**
 * 判断某个宫位内是否有传入星耀的其中一个，只要命中一个就会返回true
 *
 * @version v1.0.0
 *
 * @param $ 宫位实例
 * @param stars 星耀
 * @returns true | false
 */
export const hasOneOfStars = ($: IFunctionalPalace, stars: StarName[]): boolean => {
  const allStarsInPalace = _concatStars($.majorStars, $.minorStars, $.adjectiveStars);

  return _includeOneOf(allStarsInPalace, stars);
};

/**
 * 判断某一个宫位三方四正是否包含目标星耀，必须要全部包含才会返回true
 *
 * @param $ 三方四正的实例
 * @param stars 星耀名称数组
 * @returns true | false
 */
export const isSurroundedByStars = ($: IFunctionalSurpalaces, stars: StarName[]): boolean => {
  const allStarsInPalace = _getAllStarsInSurroundedPalaces($);

  return _includeAll(allStarsInPalace, stars);
};

/**
 * 判断三方四正内是否有传入星耀的其中一个，只要命中一个就会返回true
 *
 * @param $ 三方四正的实例
 * @param stars 星耀名称数组
 * @returns true | false
 */
export const isSurroundedByOneOfStars = ($: IFunctionalSurpalaces, stars: StarName[]) => {
  const allStarsInPalace = _getAllStarsInSurroundedPalaces($);

  return _includeOneOf(allStarsInPalace, stars);
};

/**
 * 判断某一个宫位三方四正是否不含目标星耀，必须要全部都不在三方四正内含才会返回true
 *
 * @param $ 三方四正的实例
 * @param stars 星耀名称数组
 * @returns true | false
 */
export const notSurroundedByStars = ($: IFunctionalSurpalaces, stars: StarName[]) => {
  const allStarsInPalace = _getAllStarsInSurroundedPalaces($);

  return _excludeAll(allStarsInPalace, stars);
};

export const mutagensToStars = (heavenlyStem: HeavenlyStemName, mutagens: Mutagen | Mutagen[]) => {
  const muts = Array.isArray(mutagens) ? mutagens : [mutagens];
  const stars: StarName[] = [];
  const mutagenStars = getMutagensByHeavenlyStem(heavenlyStem);

  muts.forEach((withMutagen) => {
    const mutagenIndex = MUTAGEN.indexOf(kot<MutagenKey>(withMutagen));

    if (!mutagenStars[mutagenIndex]) {
      return;
    }

    stars.push(mutagenStars[mutagenIndex]);
  });

  return stars;
};
