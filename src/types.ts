import { PalaceName } from './i18n';
import { IFunctionalHoroscope } from './astro/FunctionalHoroscope';

/**
 * 大限数据结构
 */
export interface Decade {
  range: [number, number]; // 大限年龄范围 [开始年龄, 结束年龄]
  heavenlyStem: string;    // 天干
  earthlyBranch: string;   // 地支
}

/**
 * 运限信息
 */
export interface HoroscopeInfo {
  decadal?: any;           // 大限数据
  year?: any;              // 流年数据
  month?: any;             // 流月数据
  day?: any;               // 流日数据
  yearly?: any;            // 兼容使用 (流年数据)
  monthly?: any;           // 兼容使用 (流月数据)
  daily?: any;             // 兼容使用 (流日数据)
  hourly?: any;            // 兼容使用 (流时数据)
}

/**
 * 自定义HoroscopeInfo接口，兼容所有用例
 */
export interface CustomHoroscopeInfo {
  solarDate?: string;
  lunarDate?: string;
  decadal?: any;
  yearly?: any;
  monthly?: any;
  daily?: any;
  hourly?: any;
  year?: any;
  month?: any;
  day?: any;
  hour?: any;
  age?: {
    nominalAge: number;
    index: number;
  };
  surroundPalaces?: (palaceName: string, scope: string) => any;
  [key: string]: any;
}

/**
 * 运限历史记录项
 */
export interface HoroscopeHistoryItem {
  type: string;           // 运限类型
  data: any;              // 运限数据
  fullData: any;          // 完整运限数据
  decadeIndex?: number;   // 大限索引
  yearIndex?: number;     // 流年索引
  monthIndex?: number;    // 流月索引
  dayIndex?: number;      // 流日索引
  comment: string;        // 描述信息
  lifePalaceIndex: number; // 命宫索引
  surroundedPalaces?: any; // 三方四正
} 