/**
 * 月干支结果接口
 */
export interface MonthGanZhi {
  /** 月份索引 (0-11) */
  monthIndex: number;
  /** 月份名称 (1-12月) */
  monthName: string;
  /** 天干 */
  gan: string;
  /** 地支 */
  zhi: string;
  /** 完整干支表示 */
  ganZhi: string;
}

/**
 * 系统兼容的流月数据结构
 */
export interface SystemMonthData {
  /** 月份索引 */
  index: number;
  /** 名称标识 */
  name: string;
  /** 天干 */
  heavenlyStem: string;
  /** 地支 */
  earthlyBranch: string;
  /** 宫位名称数组 */
  palaceNames: string[];
  /** 变异数据 */
  mutagen: object;
  /** 星曜数据 */
  stars: object;
}

/**
 * 流月天干地支服务类
 * 负责计算年份对应的12个月天干地支
 */
export class MonthlyGanZhiService {
  // 天干数组
  private static readonly TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  // 地支数组
  private static readonly DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  // 传统月份名称
  private static readonly MONTH_NAMES = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];

  /**
   * 根据年份计算12个月的天干地支
   * @param year 目标年份
   * @returns 12个月的天干地支数组
   */
  static calculateMonthlyGanZhi(year: number): MonthGanZhi[] {
    // 年干支索引计算 (1864年为甲子年)
    const yearIndex = (year - 1864) % 60;
    // 年天干索引 (0-9对应甲到癸)
    const yearGanIndex = yearIndex % 10;
    
    console.log(`MonthlyGanZhiService: 计算${year}年流月干支, 年干支索引=${yearIndex}, 年天干索引=${yearGanIndex}`);
    
    // 为12个月创建天干地支
    const result: MonthGanZhi[] = [];
    
    for (let i = 0; i < 12; i++) {
      // 月干 = (年干 * 2 + 月序 + 1) % 10
      const monthGanIndex = (yearGanIndex * 2 + i + 1) % 10;
      // 月支 = (月序 + 2) % 12
      const monthZhiIndex = (i + 2) % 12;
      
      // 修正负数索引
      const finalGanIndex = monthGanIndex >= 0 ? monthGanIndex : monthGanIndex + 10;
      const finalZhiIndex = monthZhiIndex >= 0 ? monthZhiIndex : monthZhiIndex + 12;
      
      // 获取天干地支
      const gan = this.TIAN_GAN[finalGanIndex];
      const zhi = this.DI_ZHI[finalZhiIndex];
      
      // 添加到结果数组
      result.push({
        monthIndex: i,
        monthName: `${i + 1}月`,
        gan,
        zhi,
        ganZhi: `${gan}${zhi}`
      });
      
      console.log(`MonthlyGanZhiService: ${i + 1}月 = ${gan}${zhi}`);
    }
    
    return result;
  }

  /**
   * 获取指定年份和月份的天干地支
   * @param year 年份
   * @param monthIndex 月份索引 (0-11)
   * @returns 月干支信息，如果月份无效则返回null
   */
  static getMonthGanZhi(year: number, monthIndex: number): MonthGanZhi | null {
    if (monthIndex < 0 || monthIndex > 11) {
      console.error(`MonthlyGanZhiService: 无效的月份索引 ${monthIndex}`);
      return null;
    }
    
    const allMonths = this.calculateMonthlyGanZhi(year);
    return allMonths[monthIndex];
  }

  /**
   * 获取系统兼容格式的月份数据
   * @param year 目标年份
   * @param monthIndex 月份索引(0-11)，不传则返回当前月
   * @returns 系统兼容的流月数据
   */
  static getSystemMonthData(year: number, monthIndex?: number): SystemMonthData {
    // 如果未指定月份，则使用当前月
    const targetMonth = monthIndex !== undefined ? monthIndex : new Date().getMonth();
    
    // 获取月干支数据
    const monthGanZhi = this.getMonthGanZhi(year, targetMonth);
    
    if (!monthGanZhi) {
      console.error(`MonthlyGanZhiService: 无法获取${year}年第${targetMonth+1}月干支`);
      // 返回一个默认值
      return {
        index: targetMonth,
        name: this.MONTH_NAMES[targetMonth] || `${targetMonth + 1}月`,
        heavenlyStem: '未',
        earthlyBranch: '知',
        palaceNames: Array(12).fill(''),
        mutagen: {},
        stars: {}
      };
    }
    
    // 转换为系统兼容格式
    return {
      index: targetMonth,
      name: this.MONTH_NAMES[targetMonth] || `${targetMonth + 1}月`,
      heavenlyStem: monthGanZhi.gan,
      earthlyBranch: monthGanZhi.zhi,
      palaceNames: Array(12).fill(''), // 填充12个宫位名称占位符
      mutagen: {}, // 空变异数据
      stars: {}    // 空星曜数据
    };
  }
  
  /**
   * 计算指定年份的所有12个月的系统兼容格式数据
   * @param year 目标年份
   * @returns 12个月的系统兼容格式数据数组
   */
  static calculateAllMonthsData(year: number): SystemMonthData[] {
    console.log(`MonthlyGanZhiService: 计算${year}年所有月份系统兼容数据`);
    
    // 创建12个月的数据
    const result: SystemMonthData[] = [];
    
    for (let i = 0; i < 12; i++) {
      // 获取系统兼容格式的月份数据
      const monthData = this.getSystemMonthData(year, i);
      
      // 设置月份名称为传统名称
      monthData.name = this.MONTH_NAMES[i] || `${i + 1}月`;
      
      // 添加到结果数组
      result.push(monthData);
      
      // 输出计算结果
      console.log(`MonthlyGanZhiService: ${year}年${monthData.name} = ${monthData.heavenlyStem}${monthData.earthlyBranch}`);
    }
    
    return result;
  }
} 