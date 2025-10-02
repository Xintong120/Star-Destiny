/**
 * 控制台测试脚本
 * 
 * 使用方法：
 * 1. 在项目根目录运行: node test-modules.js
 * 2. 或者在 package.json 中添加脚本: "test:modules": "node test-modules.js"
 */

// 由于是 ES6 模块，需要使用动态导入
async function runTests() {
  try {
    console.log('[INFO] 开始加载模块...');
    
    // 动态导入模块（需要编译后的 JS 文件）
    const kuiYueModule = await import('./dist/src/star/modules/kui-yue.js');
    const zuoYouModule = await import('./dist/src/star/modules/zuo-you.js');
    const kongJieModule = await import('./dist/src/star/modules/kong-jie.js');
    
    console.log('[SUCCESS] 模块加载成功！');
    
    // 测试天魁天钺模块
    console.log('\n=== 测试天魁天钺模块 ===');
    kuiYueModule.quickVerifyKuiYue();
    
    // 测试左辅右弼模块
    console.log('\n=== 测试左辅右弼模块 ===');
    zuoYouModule.quickVerifyZuoYou();
    zuoYouModule.verifyZuoYouSymmetry();
    
    // 测试地空地劫模块
    console.log('\n=== 测试地空地劫模块 ===');
    kongJieModule.quickVerifyKongJie();
    kongJieModule.verifyKongJieSymmetry();
    
    console.log('\n[SUCCESS] 所有测试完成！');
    
  } catch (error) {
    console.error('[ERROR] 测试失败:', error.message);
    console.log('\n[HELP] 请确保：');
    console.log('1. 已运行 npm run build 编译项目');
    console.log('2. dist 目录存在编译后的文件');
    console.log('3. 模块路径正确');
  }
}

// 运行测试
runTests();
