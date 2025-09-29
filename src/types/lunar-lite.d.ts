// lunar-lite 类型声明文件
declare module 'lunar-lite' {
  // 农历日期接口
  export interface LunarDate {
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    isLeap: boolean;
    lunarYearName: string;
    lunarMonthName: string;
    lunarDayName: string;
    zodiac: string;
    gzYear: string;
    gzMonth: string;
    gzDay: string;
    constellation: string;
    ncWeek: string;
    weekDay: number;
  }

  // 天干地支日期接口
  export interface HeavenlyStemAndEarthlyBranchDate {
    yearly: [string, string];
    monthly: [string, string];
    daily: [string, string];
    hourly: [string, string];
  }

  // 配置选项接口
  export interface DateOptions {
    year?: 'solar' | 'lunar';
    month?: 'solar' | 'lunar';
    day?: 'solar' | 'lunar';
  }

  /**
   * 阳历转农历
   * @param solarDate 阳历日期字符串 YYYY-MM-DD
   * @returns 农历日期信息
   */
  export function solar2lunar(solarDate: string): LunarDate;

  /**
   * 根据阳历日期获取天干地支
   * @param solarDate 阳历日期字符串 YYYY-MM-DD
   * @param timeIndex 时辰索引 0-12
   * @param options 配置选项
   * @returns 天干地支日期
   */
  export function getHeavenlyStemAndEarthlyBranchBySolarDate(
    solarDate: string,
    timeIndex: number,
    options?: DateOptions
  ): HeavenlyStemAndEarthlyBranchDate;

  /**
   * 获取农历月份的总天数
   * @param solarDate 阳历日期字符串 YYYY-MM-DD
   * @returns 该农历月的总天数
   */
  export function getTotalDaysOfLunarMonth(solarDate: string): number;

  // 导出类型
  export namespace types {
    export { LunarDate, HeavenlyStemAndEarthlyBranchDate, DateOptions };
  }
}

// 为了兼容现有的导入方式
declare module 'lunar-lite/lib/types' {
  export * from 'lunar-lite';
}
