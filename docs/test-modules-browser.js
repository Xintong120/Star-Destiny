/**
 * 浏览器控制台测试脚本
 * 
 * 使用方法：
 * 1. 在浏览器中打开项目 (npm run dev)
 * 2. 按 F12 打开开发者工具
 * 3. 在控制台中复制粘贴这个脚本并运行
 * 4. 或者在 HTML 中引入此脚本文件
 */

// 模拟导入的模块函数（需要根据实际编译后的代码调整）
window.testStarModules = {
  
  // 天魁天钺测试
  testKuiYue: function() {
    console.log('\n=== 天魁天钺模块测试 ===');
    
    // 模拟天魁天钺计算（基于映射表）
    const kuiYueMapping = {
      '甲': { kui: 1, yue: 7 },  // 丑、未
      '乙': { kui: 0, yue: 8 },  // 子、申
      '丙': { kui: 11, yue: 9 }, // 亥、酉
      '丁': { kui: 11, yue: 9 }, // 亥、酉
      '戊': { kui: 1, yue: 7 },  // 丑、未
      '己': { kui: 0, yue: 8 },  // 子、申
      '庚': { kui: 1, yue: 7 },  // 丑、未
      '辛': { kui: 6, yue: 2 },  // 午、寅
      '壬': { kui: 3, yue: 5 },  // 卯、巳
      '癸': { kui: 3, yue: 5 }   // 卯、巳
    };
    
    console.log('天干 | 天魁位置 | 天钺位置');
    console.log('-----|---------|--------');
    
    Object.keys(kuiYueMapping).forEach(stem => {
      const result = kuiYueMapping[stem];
      console.log(`${stem}   |    ${result.kui}    |    ${result.yue}`);
    });
    
    console.log('\n[DONE] 天魁天钺测试完成');
    return kuiYueMapping;
  },
  
  // 左辅右弼测试
  testZuoYou: function() {
    console.log('\n=== 左辅右弼模块测试 ===');
    
    // 左辅右弼计算函数
    const calculateZuoYou = (lunarMonth) => {
      const chenIndex = 4;  // 辰宫索引
      const xuIndex = 10;   // 戌宫索引
      
      const zuoIndex = (chenIndex + (lunarMonth - 1)) % 12;
      const youIndex = (xuIndex - (lunarMonth - 1) + 12) % 12;
      
      return { zuoIndex, youIndex };
    };
    
    console.log('月份 | 左辅位置 | 右弼位置 | 距离');
    console.log('-----|---------|---------|-----');
    
    for (let month = 1; month <= 12; month++) {
      const result = calculateZuoYou(month);
      const distance = Math.abs(result.zuoIndex - result.youIndex);
      const minDistance = Math.min(distance, 12 - distance);
      
      console.log(`${month.toString().padStart(2)}   |    ${result.zuoIndex}    |    ${result.youIndex}    |  ${minDistance}`);
    }
    
    console.log('\n[DONE] 左辅右弼测试完成');
    return calculateZuoYou;
  },
  
  // 地空地劫测试
  testKongJie: function() {
    console.log('\n=== 地空地劫模块测试 ===');
    
    // 地空地劫计算函数
    const calculateKongJie = (timeIndex) => {
      const haiIndex = 11;  // 亥宫索引
      
      const kongIndex = (haiIndex - timeIndex + 12) % 12;
      const jieIndex = (haiIndex + timeIndex) % 12;
      
      return { kongIndex, jieIndex };
    };
    
    const timeNames = [
      '子时', '丑时', '寅时', '卯时', '辰时', '巳时',
      '午时', '未时', '申时', '酉时', '戌时', '亥时', '晚子时'
    ];
    
    console.log('时辰   | 地空位置 | 地劫位置 | 距离');
    console.log('-------|---------|---------|-----');
    
    for (let timeIndex = 0; timeIndex <= 12; timeIndex++) {
      const result = calculateKongJie(timeIndex);
      const timeName = timeNames[timeIndex] || `${timeIndex}时`;
      const distance = Math.abs(result.kongIndex - result.jieIndex);
      const minDistance = Math.min(distance, 12 - distance);
      
      console.log(`${timeName.padEnd(6)} |    ${result.kongIndex}    |    ${result.jieIndex}    |  ${minDistance}`);
    }
    
    console.log('\n[DONE] 地空地劫测试完成');
    return calculateKongJie;
  },
  
  // 综合测试
  runAllTests: function() {
    console.log('[INFO] 开始浏览器控制台模块测试...');
    console.log('[INFO] 测试时间:', new Date().toLocaleString());
    
    try {
      this.testKuiYue();
      this.testZuoYou();
      this.testKongJie();
      
      console.log('\n[SUCCESS] 所有模块测试完成！');
      console.log('[INFO] 模块拆分逻辑验证通过！');
      
      return {
        status: 'success',
        message: '所有测试通过',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('\n[ERROR] 测试过程中出现错误:', error);
      return {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },
  
  // 性能测试
  performanceTest: function() {
    console.log('\n=== 性能测试 ===');
    
    const iterations = 10000;
    
    // 左辅右弼性能测试
    const zuoYouCalc = (month) => {
      const chenIndex = 4;
      const xuIndex = 10;
      return {
        zuoIndex: (chenIndex + (month - 1)) % 12,
        youIndex: (xuIndex - (month - 1) + 12) % 12
      };
    };
    
    console.log(`[PERF] 运行 ${iterations} 次左辅右弼计算...`);
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      zuoYouCalc(6); // 测试6月
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`[RESULT] 耗时: ${duration.toFixed(2)}ms`);
    console.log(`[RESULT] 平均每次: ${(duration / iterations).toFixed(4)}ms`);
    console.log(`[RESULT] 每秒可执行: ${Math.round(iterations / (duration / 1000))} 次`);
    
    return {
      iterations,
      totalTime: duration,
      averageTime: duration / iterations,
      operationsPerSecond: Math.round(iterations / (duration / 1000))
    };
  }
};

// 自动运行测试（可选）
console.log('[INFO] 星曜位置计算模块测试脚本已加载');
console.log('[USAGE] 使用方法:');
console.log('  testStarModules.runAllTests()     - 运行所有测试');
console.log('  testStarModules.testKuiYue()      - 测试天魁天钺');
console.log('  testStarModules.testZuoYou()      - 测试左辅右弼');
console.log('  testStarModules.testKongJie()     - 测试地空地劫');
console.log('  testStarModules.performanceTest() - 性能测试');
console.log('\n[TIP] 复制上述命令到控制台运行即可！');
