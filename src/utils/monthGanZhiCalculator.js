/**
 * 流月天干地支计算工具
 * 
 * 这是一个独立的计算工具，用来作为最后的备用方案
 * 当iztro库的方法和MonthlyGanZhiService服务都无法获取流月天干地支时使用
 */

// 天干数组
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支数组
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 传统月份名称
const MONTH_NAMES = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];

/**
 * 计算指定年份所有月份的天干地支
 * 
 * 计算方法：
 * 1. 取年干支，年干索引为yearGanIndex
 * 2. 月干 = (年干索引 * 2 + 月序 + 1) % 10
 * 3. 月支 = (月序 + 2) % 12
 * 
 * @param {number} year 年份
 * @returns {Array} 返回12个月的天干地支数组
 */
export function calculateMonthlyGanZhi(year) {
  // 确保year是数字类型
  const yearNum = parseInt(year);
  if (isNaN(yearNum)) {
    console.error(`[流月计算] 无效的年份: ${year}`);
    return [];
  }
  
  // 年干支索引计算 (1864年为甲子年)
  const yearIndex = (yearNum - 1864) % 60;
  
  // 年天干索引 (0-9对应甲到癸)
  const yearGanIndex = yearIndex % 10;
  
  console.log(`[流月计算] 计算${yearNum}年流月干支, 年天干索引=${yearGanIndex}`);
  
  // 为12个月创建天干地支
  const result = [];
  
  for (let i = 0; i < 12; i++) {
    // 月干 = (年干 * 2 + 月序 + 1) % 10
    const monthGanIndex = (yearGanIndex * 2 + i + 1) % 10;
    
    // 月支 = (月序 + 2) % 12
    const monthZhiIndex = (i + 2) % 12;
    
    // 修正负数索引
    const finalGanIndex = monthGanIndex >= 0 ? monthGanIndex : (monthGanIndex + 10) % 10;
    const finalZhiIndex = monthZhiIndex >= 0 ? monthZhiIndex : (monthZhiIndex + 12) % 12;
    
    // 获取天干地支
    const gan = TIAN_GAN[finalGanIndex];
    const zhi = DI_ZHI[finalZhiIndex];
    
    // 确保天干地支不为空
    if (!gan || !zhi) {
      console.error(`[流月计算] 计算出的天干地支无效: 月=${i+1}, 干索引=${finalGanIndex}, 支索引=${finalZhiIndex}`);
    }
    
    // 添加到结果数组
    result.push({
      index: i,
      name: MONTH_NAMES[i],
      heavenlyStem: gan || '未',
      earthlyBranch: zhi || '知',
      palaceNames: Array(12).fill(''),
      mutagen: {},
      stars: {}
    });
    
    console.log(`[流月计算] ${MONTH_NAMES[i]}: ${gan}${zhi} (干索引=${finalGanIndex}, 支索引=${finalZhiIndex})`);
  }
  
  console.log(`[流月计算] 完成${yearNum}年流月干支计算，共${result.length}个月`);
  
  return result;
}

/**
 * 获取单个月份的天干地支
 * 
 * @param {number} year 年份
 * @param {number} monthIndex 月份索引(0-11)
 * @returns {Object} 返回月份天干地支对象，失败则返回null
 */
export function getMonthGanZhi(year, monthIndex) {
  if (monthIndex < 0 || monthIndex > 11) {
    console.error(`[流月计算] 无效的月份索引: ${monthIndex}`);
    return null;
  }
  
  const allMonths = calculateMonthlyGanZhi(year);
  return allMonths[monthIndex];
}

export default {
  calculateMonthlyGanZhi,
  getMonthGanZhi
}; 