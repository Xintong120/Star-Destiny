import { computed } from 'vue';
import type { IFunctionalAstrolabe } from '../astro/FunctionalAstrolabe';
import type { Ref } from 'vue';

/**
 * 封装所有与紫微斗数宫位相关的纯计算逻辑
 * @param astrolabe - 响应式的星盘对象 Ref
 * @param selectedPalaceIndex - 响应式的当前选中宫位索引 Ref
 */
export function usePalaceCalculations(
  astrolabe: Ref<IFunctionalAstrolabe | undefined>,
  selectedPalaceIndex: Ref<number | null>
) {
  // 从星盘对象中获取宫位数组
  const palaces = computed(() => astrolabe.value?.palaces ?? []);

  /**
   * 计算对宫索引
   */
  const oppositePalaceIndex = computed<number | null>(() => {
    if (selectedPalaceIndex.value === null || !astrolabe.value) {
      return null;
    }
    
    try {
      const selectedPalace = palaces.value[selectedPalaceIndex.value];
      if (!selectedPalace) return null;
      
      const earthlyBranchArray = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
      const earthlyBranchIndex = earthlyBranchArray.indexOf(selectedPalace.earthlyBranch);
      
      if (earthlyBranchIndex !== -1) {
        const oppositeEarthlyBranch = earthlyBranchArray[(earthlyBranchIndex + 6) % 12];
        const oppositeIndex = palaces.value.findIndex(p => p.earthlyBranch === oppositeEarthlyBranch);
        return oppositeIndex !== -1 ? oppositeIndex : null;
      }
    } catch (error) {
      console.error("获取对宫出错:", error);
    }
    
    return null;
  });

  /**
   * 计算三方四正宫位索引（官禄位和财帛位）
   */
  const surroundedPalaceIndices = computed<number[]>(() => {
    if (selectedPalaceIndex.value === null || !astrolabe.value) {
      return [];
    }
    
    try {
      const surrounded = astrolabe.value.surroundedPalaces(selectedPalaceIndex.value);
      if (!surrounded) return [];
      
      const indices: number[] = [];
      
      if (surrounded.career) {
        const careerIndex = palaces.value.findIndex(p => p.earthlyBranch === surrounded.career.earthlyBranch && p.heavenlyStem === surrounded.career.heavenlyStem);
        if (careerIndex !== -1) indices.push(careerIndex);
      }
      
      if (surrounded.wealth) {
        const wealthIndex = palaces.value.findIndex(p => p.earthlyBranch === surrounded.wealth.earthlyBranch && p.heavenlyStem === surrounded.wealth.heavenlyStem);
        if (wealthIndex !== -1) indices.push(wealthIndex);
      }
      
      return indices;
    } catch (error) {
      console.error("获取三方四正出错:", error);
      return [];
    }
  });

  /**
   * 计算星座
   */
  const zodiacSign = computed(() => {
    if (!astrolabe.value?.solarDate) return '';
  
    const [, month, day] = astrolabe.value.solarDate.split('-').map(Number);
    const monthDay = month * 100 + day;
    
    if ((monthDay >= 321 && monthDay <= 419)) return '白羊座';
    if ((monthDay >= 420 && monthDay <= 520)) return '金牛座';
    if ((monthDay >= 521 && monthDay <= 621)) return '双子座';
    if ((monthDay >= 622 && monthDay <= 722)) return '巨蟹座';
    if ((monthDay >= 723 && monthDay <= 822)) return '狮子座';
    if ((monthDay >= 823 && monthDay <= 922)) return '处女座';
    if ((monthDay >= 923 && monthDay <= 1023)) return '天秤座';
    if ((monthDay >= 1024 && monthDay <= 1122)) return '天蝎座';
    if ((monthDay >= 1123 && monthDay <= 1221)) return '射手座';
    if ((monthDay >= 1222 || monthDay <= 119)) return '摩羯座';
    if ((monthDay >= 120 && monthDay <= 218)) return '水瓶座';
    if ((monthDay >= 219 && monthDay <= 320)) return '双鱼座';
    
    return '';
  });

  /**
   * 计算虚岁
   */
  const nominalAge = computed(() => {
    if (!astrolabe.value) return '';
    try {
      const horoscope = astrolabe.value.horoscope();
      if (horoscope?.age?.nominalAge) {
        return horoscope.age.nominalAge;
      }
      
      if (astrolabe.value.solarDate) {
        const birthYear = parseInt(astrolabe.value.solarDate.split('-')[0]);
        if (!isNaN(birthYear)) {
          return new Date().getFullYear() - birthYear + 1;
        }
      }
      return '';
    } catch (error) {
      console.error('计算虚岁出错:', error);
      return '';
    }
  });

  const lifePalaceBranch = computed(() => astrolabe.value?.palace('命宫')?.earthlyBranch ?? '');
  const bodyPalaceBranch = computed(() => palaces.value.find(p => p.isBodyPalace)?.earthlyBranch ?? '');

  /**
   * 获取时辰信息
   */
  const timeInfo = computed(() => {
    if (!astrolabe.value) return '';
    const times = ['早子时(0-1)', '丑时(1-3)', '寅时(3-5)', '卯时(5-7)', '辰时(7-9)', '巳时(9-11)', '午时(11-13)', '未时(13-15)', '申时(15-17)', '酉时(17-19)', '戌时(19-21)', '亥时(21-23)', '晚子时(23-0)'];
    const chineseDateParts = astrolabe.value.chineseDate.split(' ');
    const timeColumn = chineseDateParts.length > 3 ? chineseDateParts[3] : '';
    const timeBranch = timeColumn.length >= 1 ? timeColumn.charAt(1) : '';
    
    const branchToTimeIndex: { [key: string]: number[] } = {
      '子': [0, 12], '丑': [1], '寅': [2], '卯': [3], '辰': [4], '巳': [5],
      '午': [6], '未': [7], '申': [8], '酉': [9], '戌': [10], '亥': [11]
    };
    
    if (timeBranch && branchToTimeIndex[timeBranch]) {
      return times[branchToTimeIndex[timeBranch][0]];
    }
    
    return timeColumn;
  });

  return {
    palaces,
    oppositePalaceIndex,
    surroundedPalaceIndices,
    zodiacSign,
    nominalAge,
    lifePalaceBranch,
    bodyPalaceBranch,
    timeInfo,
  };
} 