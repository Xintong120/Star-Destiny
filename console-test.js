// 直接复制到浏览器 F12 控制台运行的测试代码

// 天魁天钺测试
function testKuiYue() {
  console.log('\n=== 天魁天钺模块测试 ===');
  
  const kuiYueMapping = {
    '甲': { kui: 1, yue: 7 },   // 丑、未
    '乙': { kui: 0, yue: 8 },   // 子、申
    '丙': { kui: 11, yue: 9 },  // 亥、酉
    '丁': { kui: 11, yue: 9 },  // 亥、酉
    '戊': { kui: 1, yue: 7 },   // 丑、未
    '己': { kui: 0, yue: 8 },   // 子、申
    '庚': { kui: 1, yue: 7 },   // 丑、未
    '辛': { kui: 6, yue: 2 },   // 午、寅
    '壬': { kui: 3, yue: 5 },   // 卯、巳
    '癸': { kui: 3, yue: 5 }    // 卯、巳
  };
  
  console.table(kuiYueMapping);
  console.log('[DONE] 天魁天钺测试完成');
}

// 左辅右弼测试
function testZuoYou() {
  console.log('\n=== 左辅右弼模块测试 ===');
  
  const results = [];
  for (let month = 1; month <= 12; month++) {
    const chenIndex = 4;  // 辰宫
    const xuIndex = 10;   // 戌宫
    
    const zuoIndex = (chenIndex + (month - 1)) % 12;
    const youIndex = (xuIndex - (month - 1) + 12) % 12;
    
    results.push({
      月份: month,
      左辅位置: zuoIndex,
      右弼位置: youIndex,
      距离: Math.min(Math.abs(zuoIndex - youIndex), 12 - Math.abs(zuoIndex - youIndex))
    });
  }
  
  console.table(results);
  console.log('[DONE] 左辅右弼测试完成');
}

// 地空地劫测试
function testKongJie() {
  console.log('\n=== 地空地劫模块测试 ===');
  
  const timeNames = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时', '晚子时'];
  const results = [];
  
  for (let timeIndex = 0; timeIndex <= 12; timeIndex++) {
    const haiIndex = 11;  // 亥宫
    
    const kongIndex = (haiIndex - timeIndex + 12) % 12;
    const jieIndex = (haiIndex + timeIndex) % 12;
    
    results.push({
      时辰: timeNames[timeIndex],
      地空位置: kongIndex,
      地劫位置: jieIndex,
      距离: Math.min(Math.abs(kongIndex - jieIndex), 12 - Math.abs(kongIndex - jieIndex))
    });
  }
  
  console.table(results);
  console.log('[DONE] 地空地劫测试完成');
}

// 运行所有测试
function runAllTests() {
  console.log('%c[INFO] 开始星曜位置计算模块测试', 'color: blue; font-weight: bold');
  console.log('[INFO] 测试时间:', new Date().toLocaleString());
  
  testKuiYue();
  testZuoYou();
  testKongJie();
  
  console.log('%c[SUCCESS] 所有模块测试完成！', 'color: green; font-weight: bold');
}

// 性能测试
function performanceTest() {
  console.log('\n=== 性能测试 ===');
  
  const iterations = 100000;
  
  // 左辅右弼计算
  const zuoYouCalc = (month) => ({
    zuoIndex: (4 + (month - 1)) % 12,
    youIndex: (10 - (month - 1) + 12) % 12
  });
  
  console.time('左辅右弼计算');
  for (let i = 0; i < iterations; i++) {
    zuoYouCalc(6);
  }
  console.timeEnd('左辅右弼计算');
  
  // 地空地劫计算
  const kongJieCalc = (timeIndex) => ({
    kongIndex: (11 - timeIndex + 12) % 12,
    jieIndex: (11 + timeIndex) % 12
  });
  
  console.time('地空地劫计算');
  for (let i = 0; i < iterations; i++) {
    kongJieCalc(6);
  }
  console.timeEnd('地空地劫计算');
  
  console.log(`[INFO] 每个函数运行 ${iterations} 次`);
}

// 文昌文曲测试（按时辰）
function testChangQu() {
  console.log('\n=== 文昌文曲模块测试（按时辰） ===');
  
  const timeNames = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时', '晚子时'];
  const results = [];
  
  for (let timeIndex = 0; timeIndex <= 12; timeIndex++) {
    const chenIndex = 4;  // 辰宫
    const xuIndex = 10;   // 戌宫
    
    const changIndex = (xuIndex - timeIndex + 12) % 12;  // 文昌：戌宫逆数
    const quIndex = (chenIndex + timeIndex) % 12;        // 文曲：辰宫顺数
    
    results.push({
      时辰: timeNames[timeIndex],
      文昌位置: changIndex,
      文曲位置: quIndex,
      距离: Math.min(Math.abs(changIndex - quIndex), 12 - Math.abs(changIndex - quIndex))
    });
  }
  
  console.table(results);
  console.log('[DONE] 文昌文曲测试完成');
}

// 文昌文曲测试（按天干）
function testChangQuByHeavenlyStem() {
  console.log('\n=== 流昌流曲模块测试（按天干） ===');
  
  const changQuMapping = {
    '甲': { chang: 5, qu: 9 },   // 巳、酉
    '乙': { chang: 6, qu: 8 },   // 午、申
    '丙': { chang: 8, qu: 6 },   // 申、午
    '丁': { chang: 9, qu: 5 },   // 酉、巳
    '戊': { chang: 8, qu: 6 },   // 申、午
    '己': { chang: 9, qu: 5 },   // 酉、巳
    '庚': { chang: 11, qu: 3 },  // 亥、卯
    '辛': { chang: 0, qu: 2 },   // 子、寅
    '壬': { chang: 2, qu: 0 },   // 寅、子
    '癸': { chang: 3, qu: 11 }   // 卯、亥
  };
  
  console.table(changQuMapping);
  console.log('[DONE] 流昌流曲测试完成');
}

// 火星铃星测试
function testHuoLing() {
  console.log('\n=== 火星铃星模块测试 ===');
  
  const huoLingMapping = {
    // 寅午戌组：火星从丑开始，铃星从卯开始
    '寅': { huoBase: 1, lingBase: 3 },
    '午': { huoBase: 1, lingBase: 3 },
    '戌': { huoBase: 1, lingBase: 3 },
    // 申子辰组：火星从寅开始，铃星从戌开始
    '申': { huoBase: 2, lingBase: 10 },
    '子': { huoBase: 2, lingBase: 10 },
    '辰': { huoBase: 2, lingBase: 10 },
    // 巳酉丑组：火星从卯开始，铃星从戌开始
    '巳': { huoBase: 3, lingBase: 10 },
    '酉': { huoBase: 3, lingBase: 10 },
    '丑': { huoBase: 3, lingBase: 10 },
    // 亥卯未组：火星从酉开始，铃星从戌开始
    '亥': { huoBase: 9, lingBase: 10 },
    '卯': { huoBase: 9, lingBase: 10 },
    '未': { huoBase: 9, lingBase: 10 }
  };
  
  console.log('地支三合局分组 - 火星铃星起始位置:');
  console.table(huoLingMapping);
  
  // 示例：寅支子时的火星铃星位置
  const timeIndex = 0; // 子时
  const yinResult = {
    火星位置: (huoLingMapping['寅'].huoBase + timeIndex) % 12,
    铃星位置: (huoLingMapping['寅'].lingBase + timeIndex) % 12
  };
  console.log('\n示例 - 寅支子时:', yinResult);
  console.log('[DONE] 火星铃星测试完成');
}

// 红鸾天喜测试
function testLuanXi() {
  console.log('\n=== 红鸾天喜模块测试 ===');
  
  const branches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  const results = [];
  
  branches.forEach(branch => {
    const maoIndex = 3; // 卯宫索引
    const branchIndex = branches.indexOf(branch);
    
    const hongluanIndex = (maoIndex - branchIndex + 12) % 12;
    const tianxiIndex = (hongluanIndex + 6) % 12;
    
    results.push({
      年支: branch,
      红鸾位置: hongluanIndex,
      天喜位置: tianxiIndex,
      距离: 6  // 天喜始终在红鸾对宫
    });
  });
  
  console.table(results);
  console.log('[DONE] 红鸾天喜测试完成');
}

// 华盖咸池测试
function testHuagaiXianchi() {
  console.log('\n=== 华盖咸池模块测试 ===');
  
  const huagaiXianchiMapping = {
    // 寅午戌组：华盖在戌，咸池在卯
    '寅': { huagai: 10, xianchi: 3 },
    '午': { huagai: 10, xianchi: 3 },
    '戌': { huagai: 10, xianchi: 3 },
    // 申子辰组：华盖在辰，咸池在酉
    '申': { huagai: 4, xianchi: 9 },
    '子': { huagai: 4, xianchi: 9 },
    '辰': { huagai: 4, xianchi: 9 },
    // 巳酉丑组：华盖在丑，咸池在午
    '巳': { huagai: 1, xianchi: 6 },
    '酉': { huagai: 1, xianchi: 6 },
    '丑': { huagai: 1, xianchi: 6 },
    // 亥卯未组：华盖在未，咸池在子
    '亥': { huagai: 7, xianchi: 0 },
    '卯': { huagai: 7, xianchi: 0 },
    '未': { huagai: 7, xianchi: 0 }
  };
  
  console.log('地支三合局分组 - 华盖咸池位置:');
  console.table(huagaiXianchiMapping);
  console.log('[DONE] 华盖咸池测试完成');
}

// 孤辰寡宿测试
function testGuGua() {
  console.log('\n=== 孤辰寡宿模块测试 ===');
  
  const guGuaMapping = {
    // 寅卯辰组：孤辰在巳，寡宿在丑
    '寅': { guchen: 5, guasu: 1 },
    '卯': { guchen: 5, guasu: 1 },
    '辰': { guchen: 5, guasu: 1 },
    // 巳午未组：孤辰在申，寡宿在辰
    '巳': { guchen: 8, guasu: 4 },
    '午': { guchen: 8, guasu: 4 },
    '未': { guchen: 8, guasu: 4 },
    // 申酉戌组：孤辰在亥，寡宿在未
    '申': { guchen: 11, guasu: 7 },
    '酉': { guchen: 11, guasu: 7 },
    '戌': { guchen: 11, guasu: 7 },
    // 亥子丑组：孤辰在寅，寡宿在戌
    '亥': { guchen: 2, guasu: 10 },
    '子': { guchen: 2, guasu: 10 },
    '丑': { guchen: 2, guasu: 10 }
  };
  
  console.log('地支三合局分组 - 孤辰寡宿位置:');
  console.table(guGuaMapping);
  console.log('[DONE] 孤辰寡宿测试完成');
}

// 运行所有测试
function runAllTests() {
  console.log('%c[INFO] 开始星曜位置计算模块测试', 'color: blue; font-weight: bold');
  console.log('[INFO] 测试时间:', new Date().toLocaleString());
  
  testKuiYue();
  testZuoYou();
  testKongJie();
  testChangQu();
  testChangQuByHeavenlyStem();
  testHuoLing();
  testLuanXi();
  testHuagaiXianchi();
  testGuGua();
  
  console.log('%c[SUCCESS] 所有模块测试完成！', 'color: green; font-weight: bold');
}

// 性能测试
function performanceTest() {
  console.log('\n=== 性能测试 ===');
  
  const iterations = 100000;
  
  // 左辅右弼计算
  const zuoYouCalc = (month) => ({
    zuoIndex: (4 + (month - 1)) % 12,
    youIndex: (10 - (month - 1) + 12) % 12
  });
  
  console.time('左辅右弼计算');
  for (let i = 0; i < iterations; i++) {
    zuoYouCalc(6);
  }
  console.timeEnd('左辅右弼计算');
  
  // 地空地劫计算
  const kongJieCalc = (timeIndex) => ({
    kongIndex: (11 - timeIndex + 12) % 12,
    jieIndex: (11 + timeIndex) % 12
  });
  
  console.time('地空地劫计算');
  for (let i = 0; i < iterations; i++) {
    kongJieCalc(6);
  }
  console.timeEnd('地空地劫计算');
  
  // 红鸾天喜计算
  const luanXiCalc = (branchIndex) => {
    const hongluanIndex = (3 - branchIndex + 12) % 12;
    return {
      hongluanIndex,
      tianxiIndex: (hongluanIndex + 6) % 12
    };
  };
  
  console.time('红鸾天喜计算');
  for (let i = 0; i < iterations; i++) {
    luanXiCalc(2); // 寅支
  }
  console.timeEnd('红鸾天喜计算');
  
  console.log(`[INFO] 每个函数运行 ${iterations} 次`);
}

// 提供使用说明
console.log('%c星曜位置计算模块 - 浏览器控制台测试 (v2.0)', 'color: purple; font-size: 16px; font-weight: bold');
console.log('使用方法：');
console.log('  runAllTests()              - 运行所有测试');
console.log('  testKuiYue()               - 测试天魁天钺');
console.log('  testZuoYou()               - 测试左辅右弼');
console.log('  testKongJie()              - 测试地空地劫');
console.log('  testChangQu()              - 测试文昌文曲（按时辰）');
console.log('  testChangQuByHeavenlyStem() - 测试流昌流曲（按天干）');
console.log('  testHuoLing()              - 测试火星铃星');
console.log('  testLuanXi()               - 测试红鸾天喜');
console.log('  testHuagaiXianchi()        - 测试华盖咸池');
console.log('  testGuGua()                - 测试孤辰寡宿');
console.log('  performanceTest()          - 性能测试');
console.log('\n直接输入函数名即可运行！');
