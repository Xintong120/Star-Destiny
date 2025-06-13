import type { IFunctionalAstrolabe } from '../astro/FunctionalAstrolabe';
import HoroscopeCalculator from '../astro/HoroscopeCalculator';
import type { Decade, HoroscopeHistoryItem } from '../types';

/**
 * 运限数据适配器
 * 负责将iztro库计算的运限数据转换为应用所需的格式
 */
export class HoroscopeAdapter {
  // 缓存，避免重复计算
  private static cache: Map<string, any> = new Map();
  
  // 大限起始年份计算方法
  // 1: 出生年份 + 起运年龄 - 2 (默认)
  // 2: 出生年份 + 起运年龄 - 1
  // 3: 出生年份 + 起运年龄
  private static decadalYearMethod: number = 1;

  /**
   * 清除缓存
   */
  static clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * 设置大限起始年份计算方法
   * @param method 计算方法编号(1-3)
   */
  static setDecadalYearMethod(method: number): void {
    if (method >= 1 && method <= 3) {
      this.decadalYearMethod = method;
      this.clearCache(); // 更改计算方法时清除缓存
    } else {
      console.error('无效的大限计算方法，有效值为1-3');
    }
  }
  
  /**
   * 获取当前大限起始年份计算方法
   */
  static getDecadalYearMethod(): number {
    return this.decadalYearMethod;
  }

  /**
   * 获取缓存键
   */
  private static getCacheKey(type: string, astrolabe: IFunctionalAstrolabe, date: string | Date): string {
    const astrolabeId = astrolabe.solarDate || 'unknown';
    const dateStr = typeof date === 'string' ? date : date.toISOString();
    return `${type}_${astrolabeId}_${dateStr}_method${this.decadalYearMethod}`;
  }

  /**
   * 格式化大限信息
   * @param astrolabe 命盘实例
   * @param decade 大限数据
   * @param decadeIndex 大限索引
   * @returns 格式化后的大限信息
   */
  static formatDecadalInfo(
    astrolabe: IFunctionalAstrolabe,
    decade: Decade,
    decadeIndex: number
  ): HoroscopeHistoryItem {
    // 计算大限起始年份
    const birthYear = parseInt(astrolabe.solarDate.split('-')[0]);
    const birthMonth = parseInt(astrolabe.solarDate.split('-')[1]);
    const birthDay = parseInt(astrolabe.solarDate.split('-')[2]);
    
    // 使用大限的起始年龄
    const startAge = decade.range[0];
    
    // 在紫微斗数中，大限起始年份的计算有多种方法
    // 方法1: 出生年份 + 起运年龄 - 2
    const targetYear1 = birthYear + startAge - 2;
    
    // 方法2: 出生年份 + 起运年龄 - 1
    const targetYear2 = birthYear + startAge - 1;
    
    // 方法3: 出生年份 + 起运年龄
    const targetYear3 = birthYear + startAge;
    
    // 根据选择的方法确定目标年份
    let targetYear: number;
    let methodDescription: string;
    
    switch(this.decadalYearMethod) {
      case 2:
        targetYear = targetYear2;
        methodDescription = "方法2(年份+起运年龄-1)";
        break;
      case 3:
        targetYear = targetYear3;
        methodDescription = "方法3(年份+起运年龄)";
        break;
      case 1:
      default:
        targetYear = targetYear1;
        methodDescription = "方法1(年份+起运年龄-2)";
        break;
    }
    
    // 使用年中日期（6月15日）以确保我们越过了立春，从而获得正确的年份干支
    const targetDate = new Date(targetYear, 5, 15);
    
    // 生成缓存键
    const cacheKey = this.getCacheKey('decadal', astrolabe, targetDate);
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      // 计算运限信息
      const horoscopeInfo: any = HoroscopeCalculator.calculateHoroscope(astrolabe, targetDate);
      
      // === 新增：计算大限十二宫名称 ===
      const decadalLifePalaceIndex = horoscopeInfo.decadal.index;
      const palaceNamesBase = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '仆役宫', '官禄宫', '田宅宫', '福德宫', '父母宫'];
      
      const gender = (astrolabe as any).gender;
      const birthYearGan = (astrolabe as any).chineseDate.split(' ')[0][0];
      const isYangGan = ['甲', '丙', '戊', '庚', '壬'].includes(birthYearGan);
      // 注意：这里判断顺逆时针的逻辑与紫微斗数排盘规则一致
      // 阳男阴女顺行，阴男阳女逆行。
      // 顺行是宫位索引-1（如命宫到父母宫），逆行是+1（如命宫到兄弟宫）。
      const isClockwise = (isYangGan && gender === '男') || (!isYangGan && gender === '女');

      const decadalPalaceNames = new Array(12).fill('');
      for (let i = 0; i < 12; i++) {
        let palaceIndex: number;
        if (isClockwise) {
          palaceIndex = (decadalLifePalaceIndex - i + 12) % 12;
        } else {
          palaceIndex = (decadalLifePalaceIndex + i) % 12;
        }
        decadalPalaceNames[palaceIndex] = palaceNamesBase[i];
      }
      // === 计算结束 ===
      
      // 格式化结果
      const result: HoroscopeHistoryItem = {
        type: 'decadal',
        data: {
          range: decade.range,
          heavenlyStem: decade.heavenlyStem,
          earthlyBranch: decade.earthlyBranch,
          age: startAge, // 使用起始年龄
          startYear: targetYear, // 添加起始年份信息
          palaceNames: decadalPalaceNames, // 添加大限宫位名称
          mutagen: HoroscopeCalculator.getAccurateMutagens(decade.heavenlyStem), // 修正：使用我们自己的精确方法
        },
        fullData: horoscopeInfo,
        decadeIndex,
        comment: `${decade.range[0]}-${decade.range[1]}岁 ${decade.heavenlyStem}${decade.earthlyBranch}运 (${targetYear}年起)`,
        lifePalaceIndex: decadalLifePalaceIndex // 使用大限命宫索引
      };
      
      // 缓存结果
      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('格式化大限信息出错:', error);
      throw error;
    }
  }

  /**
   * 格式化流年信息
   * @param astrolabe 命盘实例
   * @param year 目标年份
   * @param yearIndex 流年索引
   * @returns 格式化后的流年信息
   */
  static formatYearInfo(
    astrolabe: IFunctionalAstrolabe,
    year: number,
    yearIndex: number
  ): HoroscopeHistoryItem {
    // 使用年中日期（6月15日）以确保我们越过了立春，从而获得正确的年份干支
    const targetDate = new Date(year, 5, 15);
    
    // 解析出生日期
    const [birthYear, birthMonth, birthDay] = astrolabe.solarDate.split('-').map(Number);
    
    // 生成缓存键
    const cacheKey = this.getCacheKey('yearly', astrolabe, targetDate);
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      // 计算运限信息
      const horoscopeInfo: any = HoroscopeCalculator.calculateHoroscope(astrolabe, targetDate);
      
      // 在中国传统计算中，出生年即为1岁
      // 因此虚岁 = 当前年 - 出生年 + 1
      const age = year - birthYear + 1;
      
      // === 新增：计算流年十二宫名称 ===
      const palaceNamesBase = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '仆役宫', '官禄宫', '田宅宫', '福德宫', '父母宫'];
      const yearlyEarthlyBranch = horoscopeInfo.yearly?.earthlyBranch || '';
      
      // 修正：不再使用固定的地支顺序，而是从当前命盘的宫位中查找地支的实际索引
      const yearlyLifePalaceIndex = astrolabe.palaces.findIndex(p => p.earthlyBranch === yearlyEarthlyBranch);
      
      // 确定顺逆行
      const gender = (astrolabe as any).gender;
      const birthYearGan = (astrolabe as any).chineseDate.split(' ')[0][0];
      const isYangGan = ['甲', '丙', '戊', '庚', '壬'].includes(birthYearGan);
      const isClockwise = (isYangGan && gender === '男') || (!isYangGan && gender === '女');

      const yearlyPalaceNames = new Array(12).fill('');
      for (let i = 0; i < 12; i++) {
        let palaceIndex: number;
        if (isClockwise) {
          palaceIndex = (yearlyLifePalaceIndex - i + 12) % 12;
        } else {
          palaceIndex = (yearlyLifePalaceIndex + i) % 12;
        }
        yearlyPalaceNames[palaceIndex] = palaceNamesBase[i];
      }
      
      // === 计算结束 ===
      
      // 格式化结果
      const result: HoroscopeHistoryItem = {
        type: 'yearly',
        data: {
          heavenlyStem: horoscopeInfo.yearly?.heavenlyStem,
          earthlyBranch: horoscopeInfo.yearly?.earthlyBranch,
          age,
          palaceNames: yearlyPalaceNames,
          yearlyDecStar: horoscopeInfo.yearly?.yearlyDecStar,
          mutagen: HoroscopeCalculator.getAccurateMutagens(horoscopeInfo.yearly?.heavenlyStem || ''), // 修正：使用我们自己的精确方法
        },
        fullData: horoscopeInfo,
        yearIndex,
        comment: `${year}年 ${horoscopeInfo.yearly?.heavenlyStem}${horoscopeInfo.yearly?.earthlyBranch} (${age}岁)`,
        lifePalaceIndex: yearlyLifePalaceIndex,
      };
      
      // 缓存结果
      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('格式化流年运限信息出错:', error);
      throw error;
    }
  }

  /**
   * 格式化流月信息
   * @param astrolabe 命盘实例
   * @param year 目标年份
   * @param monthIndex 月份索引
   * @returns 格式化后的流月信息
   */
  static formatMonthInfo(
    astrolabe: IFunctionalAstrolabe,
    year: number,
    monthIndex: number
  ): HoroscopeHistoryItem {
    // 生成目标日期
    const targetDate = new Date(year, monthIndex, 1);
    
    // 解析出生日期
    const [birthYear, birthMonth, birthDay] = astrolabe.solarDate.split('-').map(Number);
    
    // 生成缓存键
    const cacheKey = this.getCacheKey('monthly', astrolabe, targetDate);
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      // 计算运限信息
      const horoscopeInfo = HoroscopeCalculator.calculateHoroscope(astrolabe, targetDate);
      
      // 在中国传统计算中，出生年即为1岁
      // 因此虚岁 = 当前年 - 出生年 + 1
      const age = year - birthYear + 1;
      
      // 获取月份名称
      const monthNames = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
      const monthName = monthNames[monthIndex] || `${monthIndex + 1}月`;
      
      // 处理流月数据
      let monthlyData = horoscopeInfo.monthly;
      
      // 如果流月数据是对象而非数组，需要特殊处理
      if (monthlyData && typeof monthlyData === 'object' && !Array.isArray(monthlyData)) {
        // 尝试获取当前月份的数据
        const monthKey = `${monthIndex + 1}`; // 月份索引从0开始，但数据可能从1开始
        if (monthlyData[monthKey]) {
          monthlyData = monthlyData[monthKey];
        } else {
          console.log(`流月调试: 未找到月份${monthKey}的数据，尝试使用第一个可用数据`);
          // 尝试使用第一个可用的月份数据
          const firstKey = Object.keys(monthlyData)[0];
          if (firstKey) {
            monthlyData = monthlyData[firstKey];
          }
        }
      }
      
      // 格式化结果
      const result: HoroscopeHistoryItem = {
        type: 'monthly',
        data: {
          year,
          month: monthIndex + 1,
          age,
          heavenlyStem: monthlyData?.heavenlyStem || '',
          earthlyBranch: monthlyData?.earthlyBranch || ''
        },
        fullData: horoscopeInfo,
        monthIndex,
        comment: `${year}年${monthName} ${monthlyData?.heavenlyStem || ''}${monthlyData?.earthlyBranch || ''}月`,
        lifePalaceIndex: astrolabe.palaces.findIndex(p => p.name === '命宫')
      };
      
      // 缓存结果
      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('格式化流月信息出错:', error);
      throw error;
    }
  }

  /**
   * 一次性计算某年的所有月份信息
   * @param astrolabe 命盘实例
   * @param year 目标年份
   * @returns 所有月份的天干地支及相关信息
   */
  static calculateAllMonthsForYear(astrolabe: IFunctionalAstrolabe, year: number): Array<{
    index: number;
    name: string;
    heavenlyStem: string;
    earthlyBranch: string;
    palaceNames: any[];
    mutagen: any;
    stars: any;
  }> {
    const result: Array<{
      index: number;
      name: string;
      heavenlyStem: string;
      earthlyBranch: string;
      palaceNames: any[];
      mutagen: any;
      stars: any;
    }> = [];
    
    console.log(`=== 开始计算${year}年的12个月干支信息 ===`);
    
    // 计算该年12个月的信息
    for (let month = 0; month < 12; month++) {
      // 创建完整日期 (年-月-日)
      const targetDate = new Date(year, month, 1);
      console.log(`计算${year}年${month+1}月，目标日期: ${targetDate.toISOString()}`);
      
      try {
        // 使用完整日期计算运限信息
        const horoscopeInfo = HoroscopeCalculator.calculateHoroscope(astrolabe, targetDate);
        console.log(`获取到${year}年${month+1}月的horoscopeInfo，检查流月数据...`);
        
        // 获取月份名称
        const monthNames = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        const monthName = monthNames[month] || `${month + 1}月`;
        
        // 检查流月数据
        if (!horoscopeInfo.monthly) {
          console.error(`计算${year}年${monthName}运限时未获取到流月数据`);
          throw new Error('未获取到流月数据');
        }
        
        // 获取天干地支
        const heavenlyStem = horoscopeInfo.monthly.heavenlyStem || '';
        const earthlyBranch = horoscopeInfo.monthly.earthlyBranch || '';
        
        console.log(`计算${year}年${monthName}: 天干=${heavenlyStem}, 地支=${earthlyBranch}`);
        
        // 提取月份信息
        result.push({
          index: month,
          name: monthName,
          heavenlyStem: heavenlyStem,
          earthlyBranch: earthlyBranch,
          palaceNames: horoscopeInfo.monthly.palaceNames || [],
          mutagen: horoscopeInfo.monthly.mutagen || {},
          stars: horoscopeInfo.monthly.stars || {}
        });
      } catch (error) {
        console.error(`计算${year}年${month+1}月运限出错:`, error);
        
        // 使用备用方法计算天干地支
        try {
          // 年干支索引计算 (1864年为甲子年)
          const yearIndex = (year - 1864) % 60;
          // 年天干索引 (0-9对应甲到癸)
          const yearGanIndex = yearIndex % 10;
          
          // 月干 = (年干 * 2 + 月序 + 1) % 10
          const monthGanIndex = (yearGanIndex * 2 + month + 1) % 10;
          // 月支 = (月序 + 2) % 12
          const monthZhiIndex = (month + 2) % 12;
          
          // 天干地支数组
          const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
          const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
          
          // 获取天干地支
          const gan = TIAN_GAN[monthGanIndex >= 0 ? monthGanIndex % 10 : (monthGanIndex + 10) % 10];
          const zhi = DI_ZHI[monthZhiIndex >= 0 ? monthZhiIndex % 12 : (monthZhiIndex + 12) % 12];
          
          const monthNames = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
          const monthName = monthNames[month] || `${month + 1}月`;
          
          console.log(`使用备用方法计算${year}年${monthName}: 天干=${gan}, 地支=${zhi}`);
          
          // 添加默认值防止界面出错
          result.push({
            index: month,
            name: monthName,
            heavenlyStem: gan,
            earthlyBranch: zhi,
            palaceNames: [],
            mutagen: {},
            stars: {}
          });
        } catch (backupError) {
          console.error(`备用方法计算${year}年${month+1}月干支也失败:`, backupError);
          // 添加空值
          result.push({
            index: month,
            name: `${month + 1}月`,
            heavenlyStem: '',
            earthlyBranch: '',
            palaceNames: [],
            mutagen: {},
            stars: {}
          });
        }
      }
    }
    
    console.log(`=== 计算完成，共获取到${result.length}个月的干支信息 ===`);
    // 打印所有月份的干支信息
    for (let i = 0; i < result.length; i++) {
      const month = result[i];
      console.log(`${month.name}: 天干=${month.heavenlyStem || '无'}, 地支=${month.earthlyBranch || '无'}`);
    }
    
    return result;
  }
} 