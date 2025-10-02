import { getHeavenlyStemAndEarthlyBranchBySolarDate, getTotalDaysOfLunarMonth, solar2lunar } from 'lunar-lite';
import { getConfig, getFiveElementsClass, getSoulAndBody } from '../astro';
import { EARTHLY_BRANCHES, FiveElementsClass, HEAVENLY_STEMS, PALACES } from '../data';
import {
  EarthlyBranchKey,
  EarthlyBranchName,
  FiveElementsClassKey,
  HeavenlyStemKey,
  HeavenlyStemName,
  kot,
} from '../i18n';
import { fixEarthlyBranchIndex, fixIndex, fixLunarDayIndex, fixLunarMonthIndex } from '../utils';
import { safeAsEarthlyBranchName, pipe, curry } from '../utils/fp-helpers';
import { AstrolabeParam } from '../data/types';

/**
 * 起紫微星诀算法
 *  
 * - 六五四三二，酉午亥辰丑，
 * - 局数除日数，商数宫前走；
 * - 若见数无余，便要起虎口，
 * - 日数小於局，还直宫中守。
 *
 * 举例：
 * - 例一：27日出生木三局，以三除27，循环0次就可以整除，27➗3=9，从寅进9格，在戍安紫微。
 * - 例二：13日出生火六局，以六除13，最少需要加5才能整除， 18➗8=3，从寅进3格为辰，添加数为5（奇数），故要逆回五宫，在亥安紫微。
 * - 例三：6日出生土五局，以五除6，最少需要加4才能整除，10➗5=2，从寅进2格为卯，添加数为4（偶数），顺行4格为未，在未安紫微。
 *
 * @param solarDateStr 公历日期 YYYY-MM-DD
 * @param timeIndex 时辰索引【0～12】
 * @param fixLeap 是否调整农历闰月（若该月不是闰月则不会生效）
 * @param from 根据传入的干支起五行局来计算紫微星和天府星位置
 * @returns 紫微和天府星所在宫位索引
 */
export const getStartIndex = (param: AstrolabeParam) => {
  const { solarDate, timeIndex, fixLeap, from } = param;
  const { heavenlyStemOfSoul, earthlyBranchOfSoul } = getSoulAndBody({ solarDate, timeIndex, fixLeap });
  const { lunarDay } = solar2lunar(solarDate);

  // 如果已传入干支，则用传入干支起五行局
  // 确定用于起五行局的地盘干支
  const baseHeavenlyStem = from?.heavenlyStem ?? heavenlyStemOfSoul;
  const baseEarthlyBranch = from?.earthlyBranch ?? earthlyBranchOfSoul;

  // 获取五行局
  const fiveElements = kot<FiveElementsClassKey>(getFiveElementsClass(baseHeavenlyStem, baseEarthlyBranch));
  const fiveElementsValue = FiveElementsClass[fiveElements];

  let remainder = -1; // 余数
  let quotient; // 商
  let offset = -1; // 循环次数

  // 获取当月最大天数
  const maxDays = getTotalDaysOfLunarMonth(solarDate);

  // 如果timeIndex等于12说明是晚子时，需要加一天
  let _day = timeIndex === 12 ? lunarDay + 1 : lunarDay;

  if (_day > maxDays) {
    // 假如日期超过当月最大天数，说明跨月了，需要处理为合法日期
    _day -= maxDays;
  }

  do {
    // 农历出生日（初一为1，以此类推）加上偏移量作为除数，以这个数处以五行局的数向下取整
    // 需要一直运算到余数为0为止
    offset++;

    const divisor = _day + offset;

    quotient = Math.floor(divisor / fiveElementsValue);
    remainder = divisor % fiveElementsValue;
  } while (remainder !== 0);

  // 将商除以12取余数
  quotient %= 12;

  // 以商减一（因为需要从0开始）作为起始位置
  let ziweiIndex = quotient - 1;

  if (offset % 2 === 0) {
    // 若循环次数为偶数，则索引逆时针数到循环数
    ziweiIndex += offset;
  } else {
    // 若循环次数为偶数，则索引顺时针数到循环数
    ziweiIndex -= offset;
  }

  ziweiIndex = fixIndex(ziweiIndex);

  // 天府星位置与紫微星相对
  const tianfuIndex = fixIndex(12 - ziweiIndex);

  return { ziweiIndex, tianfuIndex };
};

// 🎯 紫微星算法函数式模块化重构

/**
 * 模块1：提取和预处理基础数据
 * 职责：获取命盘基础信息，确定计算用的干支
 */
const extractBaseData = (param: AstrolabeParam) => {
  const { solarDate, timeIndex, fixLeap, from } = param;
  const soulData = getSoulAndBody({ solarDate, timeIndex, fixLeap });
  const lunarData = solar2lunar(solarDate);
  
  // 确定用于起五行局的地盘干支
  const baseHeavenlyStem = from?.heavenlyStem ?? soulData.heavenlyStemOfSoul;
  const baseEarthlyBranch = from?.earthlyBranch ?? soulData.earthlyBranchOfSoul;
  
  return {
    solarDate,
    timeIndex,
    lunarDay: lunarData.lunarDay,
    baseHeavenlyStem,
    baseEarthlyBranch
  };
};

/**
 * 模块2：计算五行局数值
 * 职责：根据干支确定五行局，返回对应的数值
 */
const calculateFiveElementsValue = (baseHeavenlyStem: HeavenlyStemName, baseEarthlyBranch: EarthlyBranchName): number => {
  const fiveElements = kot<FiveElementsClassKey>(
    getFiveElementsClass(baseHeavenlyStem, baseEarthlyBranch)
  );
  return FiveElementsClass[fiveElements];
};

/**
 * 模块3：处理农历日期边界情况
 * 职责：处理晚子时和跨月情况
 */
const processLunarDay = (lunarDay: number, timeIndex: number, solarDate: string): number => {
  const maxDays = getTotalDaysOfLunarMonth(solarDate);
  let day = timeIndex === 12 ? lunarDay + 1 : lunarDay;
  
  if (day > maxDays) {
    day -= maxDays;  // 处理跨月情况
  }
  
  return day;
};

/**
 * 模块4：查找能被五行局整除的偏移量
 * 职责：执行核心的循环查找算法
 * 这是性能关键模块，保持高效实现
 */
const findDivisibleOffset = (day: number, fiveElementsValue: number) => {
  let offset = 0;
  let remainder: number;
  let quotient: number;
  
  do {
    const divisor = day + offset;
    quotient = Math.floor(divisor / fiveElementsValue);
    remainder = divisor % fiveElementsValue;
    
    if (remainder !== 0) {
      offset++;
    }
  } while (remainder !== 0);
  
  return { offset, quotient };
};

/**
 * 模块5：计算紫微星和天府星的位置
 * 职责：根据商和偏移量计算最终的星位索引
 */
const calculateStarPositions = (quotient: number, offset: number) => {
  quotient %= 12;
  let ziweiIndex = quotient - 1;
  
  // 根据偏移量的奇偶性决定方向
  if (offset % 2 === 0) {
    ziweiIndex += offset;  // 偶数：顺时针
  } else {
    ziweiIndex -= offset;  // 奇数：逆时针
  }
  
  ziweiIndex = fixIndex(ziweiIndex);
  const tianfuIndex = fixIndex(12 - ziweiIndex);
  
  return { ziweiIndex, tianfuIndex };
};

/**
 * 紫微星算法 - 函数式模块化版本
 * 
 * 模块化优势：
 * 1. 每个模块职责单一，易于理解和测试
 * 2. 数据流清晰，便于调试和维护
 * 3. 保持原有算法逻辑的正确性
 * 4. 核心循环模块保持高性能实现
 * 5. 便于单独优化每个计算步骤
 */
export const getStartIndexFP = (param: AstrolabeParam) => {
  // 步骤1：提取基础数据
  const baseData = extractBaseData(param);
  
  // 步骤2：计算五行局数值
  const fiveElementsValue = calculateFiveElementsValue(
    baseData.baseHeavenlyStem, 
    baseData.baseEarthlyBranch
  );
  
  // 步骤3：处理农历日期
  const processedDay = processLunarDay(
    baseData.lunarDay, 
    baseData.timeIndex, 
    baseData.solarDate
  );
  
  // 步骤4：执行核心循环算法
  const { offset, quotient } = findDivisibleOffset(processedDay, fiveElementsValue);
  
  // 步骤5：计算最终星位
  return calculateStarPositions(quotient, offset);
};


//天干映射表
const HEAVENLY_STEM_TO_LU: Record<HeavenlyStemKey, EarthlyBranchName> = {
  jiaHeavenly: 'yin',    // 甲禄到寅宫
  yiHeavenly: 'mao',     // 乙禄居卯府
  bingHeavenly: 'si',    
  wuHeavenly: 'si',      
  dingHeavenly: 'woo',   
  jiHeavenly: 'woo',     
  gengHeavenly: 'shen',  
  xinHeavenly: 'you',    
  renHeavenly: 'hai',    
  guiHeavenly: 'zi'      
};

//地支映射表
const EARTHLY_BRANCH_TO_MA: Record<EarthlyBranchKey, EarthlyBranchName> = {
  yinEarthly: 'shen',
  wuEarthly: 'shen', 
  xuEarthly: 'shen',
  shenEarthly: 'yin',
  ziEarthly: 'yin',
  chenEarthly: 'yin',    
  siEarthly: 'hai',      
  youEarthly: 'hai',     
  chouEarthly: 'hai',    
  haiEarthly: 'si',      
  maoEarthly: 'si',      
  weiEarthly: 'si'       
};




// 修正后的函数式版本
export const getLuYangTuoMaIndexFP = (heavenlyStemName: HeavenlyStemName, earthlyBranchName: EarthlyBranchName) => {
  // 步骤1：转换为内部键值
  const heavenlyStem = kot<HeavenlyStemKey>(heavenlyStemName, 'Heavenly');
  const earthlyBranch = kot<EarthlyBranchKey>(earthlyBranchName, 'Earthly');
  
  // 步骤2：查找禄存位置
  const luPosition = HEAVENLY_STEM_TO_LU[heavenlyStem];  // ← 修正：使用天干映射表
  
  // 步骤3：查找天马位置  
  const maPosition = EARTHLY_BRANCH_TO_MA[earthlyBranch]; // ← 修正：直接查找，不需要函数
  
  // 步骤4：计算最终索引
  const luIndex = fixEarthlyBranchIndex(luPosition);
  const maIndex = fixEarthlyBranchIndex(maPosition);
  
  return {
    luIndex,
    maIndex,
    yangIndex: fixIndex(luIndex + 1), // 擎羊在禄存后一位
    tuoIndex: fixIndex(luIndex - 1),  // 陀罗在禄存前一位
  };
};


const HEAVENLY_STEM_TO_KUI_YUE: Record<HeavenlyStemKey, {kui: EarthlyBranchName, yue: EarthlyBranchName}> = {
  jiaHeavenly: { kui: 'chou', yue: 'wei' },
  wuHeavenly: { kui: 'chou', yue: 'wei' },
  gengHeavenly: { kui: 'chou', yue: 'wei' },
  yiHeavenly: { kui: 'zi', yue: 'shen' },      
  jiHeavenly: { kui: 'zi', yue: 'shen' },      
  xinHeavenly: { kui: 'woo', yue: 'yin' },     
  bingHeavenly: { kui: 'hai', yue: 'you' },
  dingHeavenly: { kui: 'hai', yue: 'you' },
  renHeavenly: { kui: 'mao', yue: 'si' },
  guiHeavenly: { kui: 'mao', yue: 'si' }
};



// 🎯 修正后的函数式版本
export const getKuiYueIndexFP = (heavenlyStemName: HeavenlyStemName) => {
  // 步骤1：转换为内部键值
  const heavenlyStem = kot<HeavenlyStemKey>(heavenlyStemName, 'Heavenly');
  
  // 步骤2：查找天魁天钺位置
  const positions = HEAVENLY_STEM_TO_KUI_YUE[heavenlyStem]; // ← 修正：应该是 heavenlyStem，不是 Heavenly
  
  // 步骤3：计算最终索引
  const kuiIndex = fixEarthlyBranchIndex(positions.kui);
  const yueIndex = fixEarthlyBranchIndex(positions.yue);
  
  return { kuiIndex, yueIndex };
};


/**
 * 获取左辅右弼的索引（按生月）
 *
 * - 辰上顺正寻左辅
 * - 戌上逆正右弼当
 *
 * 解释：
 *
 * - 从辰顺数农历月份数是左辅的索引
 * - 从戌逆数农历月份数是右弼的索引
 *
 * @param lunarMonth 农历月份
 * @returns 左辅、右弼索引
 */
export const getZuoYouIndex = (lunarMonth: number) => {
  const zuoIndex = fixIndex(fixEarthlyBranchIndex('chen') + (lunarMonth - 1));
  const youIndex = fixIndex(fixEarthlyBranchIndex('xu') - (lunarMonth - 1));

  return { zuoIndex, youIndex };
};

// 🎯 函数式编程重构版本
// 步骤1: 分解职责 - 创建小的纯函数
const calculateMonthOffset = (lunarMonth: number): number => lunarMonth - 1;

const calculatePalaceIndex = curry((basePosition: EarthlyBranchName, offset: number): number => 
  fixIndex(fixEarthlyBranchIndex(basePosition) + offset)
);

const calculateReversePalaceIndex = curry((basePosition: EarthlyBranchName, offset: number): number => 
  fixIndex(fixEarthlyBranchIndex(basePosition) - offset)
);

// 步骤2: 使用函数组合创建数据转换管道
const createZuoYouCalculator = (lunarMonth: number) => {
  const offset = calculateMonthOffset(lunarMonth);
  
  return {
    zuoIndex: calculatePalaceIndex('chen' as EarthlyBranchName)(offset),
    youIndex: calculateReversePalaceIndex('xu' as EarthlyBranchName)(offset)
  };
};

// 步骤3: 函数式版本 - 更清晰的意图表达
export const getZuoYouIndexFP = (lunarMonth: number) => {
  const offset = calculateMonthOffset(lunarMonth);
  
  return {
    zuoIndex: calculatePalaceIndex('chen' as EarthlyBranchName)(offset),
    youIndex: calculateReversePalaceIndex('xu' as EarthlyBranchName)(offset)
  };
};


/**
 * 获取文昌文曲的索引（按时支）
 *
 * - 辰上顺时文曲位
 * - 戌上逆时觅文昌
 *
 * 解释：
 *
 * - 从辰顺数到时辰地支索引是文曲的索引
 * - 从戌逆数到时辰地支索引是文昌的索引
 *
 * 由于时辰地支的索引即是时辰的序号，所以可以直接使用时辰的序号
 *
 * @param timeIndex 时辰索引【0～12】
 * @returns 文昌、文曲索引
 */
export const getChangQuIndex = (timeIndex: number) => {
  const changIndex = fixIndex(fixEarthlyBranchIndex('xu') - fixIndex(timeIndex));
  const quIndex = fixIndex(fixEarthlyBranchIndex('chen') + fixIndex(timeIndex));

  return { changIndex, quIndex };
};

// 🎯 Step 3.1: 提取基础计算函数 - 消除重复计算

/**
 * 标准化时辰索引
 * 职责：确保时辰索引在有效范围内
 * 优势：只计算一次，避免重复
 */
const normalizeTimeIndex = (timeIndex: number): number => fixIndex(timeIndex);

/**
 * 获取基础宫位索引
 * 职责：根据地支名称获取对应的宫位索引
 * 优势：语义清晰，可复用
 */
const getBasePosition = (earthlyBranch: EarthlyBranchName): number => 
  fixEarthlyBranchIndex(earthlyBranch);

// 🎯 Step 3.2: 创建专用计算函数 - 提高可读性

/**
 * 计算顺时针星曜索引
 * 职责：从基础位置顺时针计算到目标位置
 * 参数：basePosition - 起始宫位, offset - 偏移量
 */
const calculateForwardStarIndex = curry((basePosition: EarthlyBranchName, offset: number): number =>
  fixIndex(getBasePosition(basePosition) + offset)
);

/**
 * 计算逆时针星曜索引  
 * 职责：从基础位置逆时针计算到目标位置
 * 参数：basePosition - 起始宫位, offset - 偏移量
 */
const calculateReverseStarIndex = curry((basePosition: EarthlyBranchName, offset: number): number =>
  fixIndex(getBasePosition(basePosition) - offset)
);

// 🎯 Step 3.3: 函数式重构版本 - 清晰的数据流

/**
 * 文昌文曲索引计算 - 函数式版本
 * 
 * 优势对比：
 * 1. 消除重复计算：normalizeTimeIndex 只计算一次
 * 2. 提高可读性：函数名清晰表达业务意图
 * 3. 增强可测试性：每个步骤都可以单独测试
 * 4. 提升可复用性：小函数可以在其他地方使用
 * 5. 降低维护成本：修改某个步骤不影响其他部分
 */
export const getChangQuIndexFP = (timeIndex: number) => {
  // Step 1: 标准化输入，避免重复计算
  const normalizedTimeIndex = normalizeTimeIndex(timeIndex);
  
  // Step 2: 并行计算两个星曜位置，逻辑清晰
  return {
    // 文昌：从戌宫逆时针计算
    changIndex: calculateReverseStarIndex('xu' as EarthlyBranchName)(normalizedTimeIndex),
    // 文曲：从辰宫顺时针计算  
    quIndex: calculateForwardStarIndex('chen' as EarthlyBranchName)(normalizedTimeIndex)
  };
};

/**
 * 获取日系星索引，包括
 *
 * 三台，八座，恩光，天贵
 *
 * - 安三台八座
 *   - 由左辅之宫位起初一，顺行至生日安三台。
 *   - 由右弼之宫位起初一，逆行至生日安八座。
 *
 * - 安恩光天贵
 *   - 由文昌之宫位起初一，顺行至生日再退一步起恩光。
 *   - 由文曲之宫位起初一，顺行至生日再退一步起天贵。
 *
 * @param solarDateStr 阳历日期
 * @param timeIndex 时辰索引【0～12】
 * @returns 三台，八座索引
 */
export const getDailyStarIndex = (solarDateStr: string, timeIndex: number, fixLeap?: boolean) => {
  const { lunarDay } = solar2lunar(solarDateStr);
  const monthIndex = fixLunarMonthIndex(solarDateStr, timeIndex, fixLeap);

  // 此处获取到的是索引，下标是从0开始的，所以需要加1
  const { zuoIndex, youIndex } = getZuoYouIndex(monthIndex + 1);
  const { changIndex, quIndex } = getChangQuIndex(timeIndex);
  const dayIndex = fixLunarDayIndex(lunarDay, timeIndex);
  const santaiIndex = fixIndex((zuoIndex + dayIndex) % 12);
  const bazuoIndex = fixIndex((youIndex - dayIndex) % 12);
  const enguangIndex = fixIndex(((changIndex + dayIndex) % 12) - 1);
  const tianguiIndex = fixIndex(((quIndex + dayIndex) % 12) - 1);

  return { santaiIndex, bazuoIndex, enguangIndex, tianguiIndex };
};

/**
 * 获取时系星耀索引，包括台辅，封诰
 *
 * @param timeIndex 时辰序号【0～12】
 * @returns 台辅，封诰索引
 */
export const getTimelyStarIndex = (timeIndex: number) => {
  const taifuIndex = fixIndex(fixEarthlyBranchIndex('woo') + fixIndex(timeIndex));
  const fenggaoIndex = fixIndex(fixEarthlyBranchIndex('yin') + fixIndex(timeIndex));

  return { taifuIndex, fenggaoIndex };
};

/**
 * 获取地空地劫的索引（按时支）
 *
 * - 亥上子时顺安劫
 * - 逆回便是地空亡
 *
 * 解释：
 *
 * - 从亥顺数到时辰地支索引是地劫的索引
 * - 从亥逆数到时辰地支索引是地空的索引
 *
 * 由于时辰地支的索引即是时辰的序号，所以可以直接使用时辰的序号
 *
 * @param timeIndex 时辰索引【0～12】
 * @returns 地空、地劫索引
 */
export const getKongJieIndex = (timeIndex: number) => {
  const fixedTimeIndex = fixIndex(timeIndex);
  const haiIndex = fixEarthlyBranchIndex('hai');
  const kongIndex = fixIndex(haiIndex - fixedTimeIndex);
  const jieIndex = fixIndex(haiIndex + fixedTimeIndex);

  return { kongIndex, jieIndex };
};


// 🎯 火星铃星映射表 - 地支组→起始位置
const EARTHLY_BRANCH_TO_HUO_LING_BASE: Record<EarthlyBranchKey, {huoBase: number, lingBase: number}> = {
  // 寅午戌组：火星从丑开始，铃星从卯开始
  yinEarthly: { huoBase: fixEarthlyBranchIndex('chou'), lingBase: fixEarthlyBranchIndex('mao') },
  wuEarthly: { huoBase: fixEarthlyBranchIndex('chou'), lingBase: fixEarthlyBranchIndex('mao') },
  xuEarthly: { huoBase: fixEarthlyBranchIndex('chou'), lingBase: fixEarthlyBranchIndex('mao') },
  
  // 申子辰组：火星从寅开始，铃星从戌开始
  shenEarthly: { huoBase: fixEarthlyBranchIndex('yin'), lingBase: fixEarthlyBranchIndex('xu') },
  ziEarthly: { huoBase: fixEarthlyBranchIndex('yin'), lingBase: fixEarthlyBranchIndex('xu') },
  chenEarthly: { huoBase: fixEarthlyBranchIndex('yin'), lingBase: fixEarthlyBranchIndex('xu') },
  
  // 巳酉丑组：火星从卯开始，铃星从戌开始
  siEarthly: { huoBase: fixEarthlyBranchIndex('mao'), lingBase: fixEarthlyBranchIndex('xu') },
  youEarthly: { huoBase: fixEarthlyBranchIndex('mao'), lingBase: fixEarthlyBranchIndex('xu') },
  chouEarthly: { huoBase: fixEarthlyBranchIndex('mao'), lingBase: fixEarthlyBranchIndex('xu') },
  
  // 亥卯未组：火星从酉开始，铃星从戌开始
  haiEarthly: { huoBase: fixEarthlyBranchIndex('you'), lingBase: fixEarthlyBranchIndex('xu') },
  weiEarthly: { huoBase: fixEarthlyBranchIndex('you'), lingBase: fixEarthlyBranchIndex('xu') },
  maoEarthly: { huoBase: fixEarthlyBranchIndex('you'), lingBase: fixEarthlyBranchIndex('xu') }
};

// 🎯 函数式版本
export const getHuoLingIndexFP = (earthlyBranchName: EarthlyBranchName, timeIndex: number) => {
  // 步骤1：转换为内部键值和标准化时辰
  const earthlyBranch = kot<EarthlyBranchKey>(earthlyBranchName, 'Earthly');
  const fixedTimeIndex = fixIndex(timeIndex);
  
  // 步骤2：查找起始位置
  const basePositions = EARTHLY_BRANCH_TO_HUO_LING_BASE[earthlyBranch];
  
  // 步骤3：计算最终索引（起始位置 + 时辰偏移）
  const huoIndex = fixIndex(basePositions.huoBase + fixedTimeIndex);
  const lingIndex = fixIndex(basePositions.lingBase + fixedTimeIndex);
  
  return { huoIndex, lingIndex };
};


/**
 * 获取红鸾天喜所在宫位索引
 *
 * - 卯上起子逆数之
 * - 数到当生太岁支
 * - 坐守此宫红鸾位
 * - 对宫天喜不差移
 *
 * @param earthlyBranchName 年支
 * @returns 红鸾、天喜索引
 */
export const getLuanXiIndex = (earthlyBranchName: EarthlyBranchName) => {
  const earthlyBranch = kot<EarthlyBranchKey>(earthlyBranchName, 'Earthly');
  const hongluanIndex = fixIndex(fixEarthlyBranchIndex('mao') - EARTHLY_BRANCHES.indexOf(earthlyBranch));
  const tianxiIndex = fixIndex(hongluanIndex + 6);

  return { hongluanIndex, tianxiIndex };
};

/**
 * 安华盖
 * - 子辰申年在辰，丑巳酉年在丑
 * - 寅午戍年在戍，卯未亥年在未。
 *
 * 安咸池
 * - 子辰申年在酉，丑巳酉年在午
 * - 寅午戍年在卯，卯未亥年在子。
 *
 * @param earthlyBranchName 地支
 * @returns 华盖、咸池索引
 */
export const getHuagaiXianchiIndex = (earthlyBranchName: EarthlyBranchName) => {
  let hgIdx = -1;
  let xcIdx = -1;
  const earthlyBranch = kot<EarthlyBranchKey>(earthlyBranchName, 'Earthly');

  switch (earthlyBranch) {
    case 'yinEarthly':
    case 'wuEarthly':
    case 'xuEarthly': {
      hgIdx = fixEarthlyBranchIndex('xu');
      xcIdx = fixEarthlyBranchIndex('mao');
      break;
    }
    case 'shenEarthly':
    case 'ziEarthly':
    case 'chenEarthly': {
      hgIdx = fixEarthlyBranchIndex('chen');
      xcIdx = fixEarthlyBranchIndex('you');
      break;
    }
    case 'siEarthly':
    case 'youEarthly':
    case 'chouEarthly': {
      hgIdx = fixEarthlyBranchIndex('chou');
      xcIdx = fixEarthlyBranchIndex('woo');
      break;
    }
    case 'haiEarthly':
    case 'weiEarthly':
    case 'maoEarthly': {
      hgIdx = fixEarthlyBranchIndex('wei');
      xcIdx = fixEarthlyBranchIndex('zi');
      break;
    }
  }

  return {
    huagaiIndex: fixIndex(hgIdx),
    xianchiIndex: fixIndex(xcIdx),
  };
};

/**
 * 安孤辰寡宿
 * - 寅卯辰年安巳丑
 * - 巳午未年安申辰
 * - 申酉戍年安亥未
 * - 亥子丑年安寅戍。
 *
 * @param earthlyBranchName 地支
 * @returns 孤辰、寡宿索引
 */
export const getGuGuaIndex = (earthlyBranchName: EarthlyBranchName) => {
  let guIdx = -1;
  let guaIdx = -1;
  const earthlyBranch = kot<EarthlyBranchKey>(earthlyBranchName, 'Earthly');

  switch (earthlyBranch) {
    case 'yinEarthly':
    case 'maoEarthly':
    case 'chenEarthly': {
      guIdx = fixEarthlyBranchIndex('si');
      guaIdx = fixEarthlyBranchIndex('chou');
      break;
    }
    case 'siEarthly':
    case 'wuEarthly':
    case 'weiEarthly': {
      guIdx = fixEarthlyBranchIndex('shen');
      guaIdx = fixEarthlyBranchIndex('chen');
      break;
    }
    case 'shenEarthly':
    case 'youEarthly':
    case 'xuEarthly': {
      guIdx = fixEarthlyBranchIndex('hai');
      guaIdx = fixEarthlyBranchIndex('wei');
      break;
    }
    case 'haiEarthly':
    case 'ziEarthly':
    case 'chouEarthly': {
      guIdx = fixEarthlyBranchIndex('yin');
      guaIdx = fixEarthlyBranchIndex('xu');
      break;
    }
  }

  return {
    guchenIndex: fixIndex(guIdx),
    guasuIndex: fixIndex(guaIdx),
  };
};

/**
 * 安劫杀诀（年支）
 * 申子辰人蛇开口、亥卯未人猴速走
 * 寅午戌人猪面黑、巳酉丑人虎咆哮
 *
 * @version v2.5.0
 *
 * @param earthlyBranchKey 生年地支
 * @returns {number} 劫杀索引
 */
export const getJieshaAdjIndex = (earthlyBranchKey: EarthlyBranchKey) => {
  switch (earthlyBranchKey) {
    case 'shenEarthly':
    case 'ziEarthly':
    case 'chenEarthly':
      return 3;
    case 'haiEarthly':
    case 'maoEarthly':
    case 'weiEarthly':
      return 6;
    case 'yinEarthly':
    case 'wuEarthly':
    case 'xuEarthly':
      return 9;
    case 'siEarthly':
    case 'youEarthly':
    case 'chouEarthly':
      return 0;
  }
};

/**
 * 安大耗诀（年支）
 * 但用年支去对冲、阴阳移位过一宫
 * 阳顺阴逆移其位、大耗原来不可逢
 *
 * 大耗安法，是在年支之对宫，前一位或后一位安星。阳支顺行前一位，阴支逆行后一位。
 *
 * @param earthlyBranchKey 生年地支
 * @returns {number} 大耗索引
 */
export const getDahaoIndex = (earthlyBranchKey: EarthlyBranchKey) => {
  const matched = [
    'weiEarthly',
    'wuEarthly',
    'youEarthly',
    'shenEarthly',
    'haiEarthly',
    'xuEarthly',
    'chouEarthly',
    'ziEarthly',
    'maoEarthly',
    'yinEarthly',
    'siEarthly',
    'chenEarthly',
  ][EARTHLY_BRANCHES.indexOf(earthlyBranchKey)] as EarthlyBranchKey;

  // 因为宫位是以寅宫开始排的，所以需要 -2 来对齐
  return fixIndex(EARTHLY_BRANCHES.indexOf(matched) - 2);
};

/**
 * 获取年系星的索引，包括
 * 咸池，华盖，孤辰，寡宿, 天厨，破碎，天才，天寿，蜚蠊, 龙池，凤阁，天哭，天虚，
 * 天官，天福
 *
 * - 安天才天寿
 *   - 天才由命宫起子，顺行至本生年支安之。天寿由身宫起子，顺行至本生年支安之。
 *
 * - 安破碎
 *   - 子午卯酉年安巳宫，寅申巳亥年安酉宫，辰戍丑未年安丑宫。
 *
 * - 安天厨
 *   - 甲丁食蛇口，乙戊辛马方。丙从鼠口得，己食于猴房。庚食虎头上，壬鸡癸猪堂。
 *
 * - 安蜚蠊
 *   - 子丑寅年在申酉戍，卯辰巳年在巳午未，午未申年在寅卯辰，酉戍亥年在亥子丑。
 *
 * - 安龙池凤阁
 *   - 龙池从辰宫起子，顺至本生年支安之。凤阁从戍宫起子，逆行至本生年支安之。
 *
 * - 安天哭天虚
 *   - 天哭天虚起午宫，午宫起子两分踪，哭逆行兮虚顺转，数到生年便停留。
 *
 * - 安天官天福
 *   - 甲喜羊鸡乙龙猴，丙年蛇鼠一窝谋。丁虎擒猪戊玉兔，
 *   - 己鸡居然与虎俦。庚猪马辛鸡蛇走，壬犬马癸马蛇游。
 *
 * - 安截路空亡（截空）
 *   - 甲己之年申酉，乙庚之年午未，
 *   - 丙辛之年辰巳，丁壬之年寅卯，
 *   - 戊癸之年子丑。
 *
 * - 安天空
 *   - 生年支顺数的前一位就是。
 * @param solarDate 阳历日期
 * @param timeIndex 时辰序号
 * @param gender 性别
 * @param fixLeap 是否修复闰月，假如当月不是闰月则不生效
 */
export const getYearlyStarIndex = (param: AstrolabeParam) => {
  const { solarDate, timeIndex, gender, fixLeap } = param;
  const { horoscopeDivide, algorithm } = getConfig();
  const { yearly } = getHeavenlyStemAndEarthlyBranchBySolarDate(solarDate, timeIndex, {
    // 流耀应该用立春为界，但为了满足不同流派的需求允许配置
    year: horoscopeDivide,
  });
  const { soulIndex, bodyIndex } = getSoulAndBody({ solarDate, timeIndex, fixLeap });
  const heavenlyStem = kot<HeavenlyStemKey>(yearly[0], 'Heavenly');
  const earthlyBranch = kot<EarthlyBranchKey>(yearly[1], 'Earthly');

  const { huagaiIndex, xianchiIndex } = getHuagaiXianchiIndex(safeAsEarthlyBranchName(yearly[1]));
  const { guchenIndex, guasuIndex } = getGuGuaIndex(safeAsEarthlyBranchName(yearly[1]));
  const tiancaiIndex = fixIndex(soulIndex + EARTHLY_BRANCHES.indexOf(earthlyBranch));
  const tianshouIndex = fixIndex(bodyIndex + EARTHLY_BRANCHES.indexOf(earthlyBranch));
  const tianchuIndex = fixIndex(
    fixEarthlyBranchIndex(
      ['si', 'woo', 'zi', 'si', 'woo', 'shen', 'yin', 'woo', 'you', 'hai'][
        HEAVENLY_STEMS.indexOf(heavenlyStem)
      ] as EarthlyBranchName,
    ),
  );
  const posuiIndex = fixIndex(
    fixEarthlyBranchIndex(['si', 'chou', 'you'][EARTHLY_BRANCHES.indexOf(earthlyBranch) % 3] as EarthlyBranchName),
  );
  const feilianIndex = fixIndex(
    fixEarthlyBranchIndex(
      ['shen', 'you', 'xu', 'si', 'woo', 'wei', 'yin', 'mao', 'chen', 'hai', 'zi', 'chou'][
        EARTHLY_BRANCHES.indexOf(earthlyBranch)
      ] as EarthlyBranchName,
    ),
  );
  const longchiIndex = fixIndex(fixEarthlyBranchIndex('chen') + EARTHLY_BRANCHES.indexOf(earthlyBranch));
  const fenggeIndex = fixIndex(fixEarthlyBranchIndex('xu') - EARTHLY_BRANCHES.indexOf(earthlyBranch));
  const tiankuIndex = fixIndex(fixEarthlyBranchIndex('woo') - EARTHLY_BRANCHES.indexOf(earthlyBranch));
  const tianxuIndex = fixIndex(fixEarthlyBranchIndex('woo') + EARTHLY_BRANCHES.indexOf(earthlyBranch));
  const tianguanIndex = fixIndex(
    fixEarthlyBranchIndex(
      ['wei', 'chen', 'si', 'yin', 'mao', 'you', 'hai', 'you', 'xu', 'woo'][
        HEAVENLY_STEMS.indexOf(heavenlyStem)
      ] as EarthlyBranchName,
    ),
  );
  const tianfuIndex = fixIndex(
    fixEarthlyBranchIndex(
      ['you', 'shen', 'zi', 'hai', 'mao', 'yin', 'woo', 'si', 'woo', 'si'][
        HEAVENLY_STEMS.indexOf(heavenlyStem)
      ] as EarthlyBranchName,
    ),
  );
  const tiandeIndex = fixIndex(fixEarthlyBranchIndex('you') + EARTHLY_BRANCHES.indexOf(earthlyBranch));
  const yuedeIndex = fixIndex(fixEarthlyBranchIndex('si') + EARTHLY_BRANCHES.indexOf(earthlyBranch));
  const tiankongIndex = fixIndex(fixEarthlyBranchIndex(safeAsEarthlyBranchName(yearly[1])) + 1);
  const jieluIndex = fixIndex(
    fixEarthlyBranchIndex(
      ['shen', 'woo', 'chen', 'yin', 'zi'][HEAVENLY_STEMS.indexOf(heavenlyStem) % 5] as EarthlyBranchName,
    ),
  );
  const kongwangIndex = fixIndex(
    fixEarthlyBranchIndex(
      ['you', 'wei', 'si', 'mao', 'chou'][HEAVENLY_STEMS.indexOf(heavenlyStem) % 5] as EarthlyBranchName,
    ),
  );
  let xunkongIndex = fixIndex(
    fixEarthlyBranchIndex(safeAsEarthlyBranchName(yearly[1])) + HEAVENLY_STEMS.indexOf('guiHeavenly') - HEAVENLY_STEMS.indexOf(heavenlyStem) + 1,
  );

  // 判断命主出生年年支阴阳属性，如果结果为 0 则为阳，否则为阴
  const yinyang = EARTHLY_BRANCHES.indexOf(earthlyBranch) % 2;

  if (yinyang !== xunkongIndex % 2) {
    // 若命主出生年支阴阳属性与初始旬空宫位的阴阳属性不同，则+1
    xunkongIndex = fixIndex(xunkongIndex + 1);
  }

  // 中州派没有截路空亡，只有一颗截空星
  // 生年阳干在阳宫，阴干在阴宫
  const jiekongIndex = yinyang === 0 ? jieluIndex : kongwangIndex;

  const jieshaAdjIndex = getJieshaAdjIndex(earthlyBranch);
  const nianjieIndex = getNianjieIndex(safeAsEarthlyBranchName(yearly[1]));
  const dahaoAdjIndex = getDahaoIndex(earthlyBranch);

  const genderYinyang = ['male', 'female'];
  const sameYinyang = yinyang === genderYinyang.indexOf(kot(gender!));

  let tianshangIndex = fixIndex(PALACES.indexOf('friendsPalace') + soulIndex);
  let tianshiIndex = fixIndex(PALACES.indexOf('healthPalace') + soulIndex);

  if (algorithm === 'zhongzhou' && !sameYinyang) {
    // 中州派的天使天伤与通行版本不一样
    // 天伤奴仆、天使疾厄、夹迁移宫最易寻得
    // 凡阳男阴女，皆依此诀，但若为阴男阳女，则改为天伤居疾厄、天使居奴仆。
    [tianshiIndex, tianshangIndex] = [tianshangIndex, tianshiIndex];
  }

  return {
    xianchiIndex,
    huagaiIndex,
    guchenIndex,
    guasuIndex,
    tiancaiIndex,
    tianshouIndex,
    tianchuIndex,
    posuiIndex,
    feilianIndex,
    longchiIndex,
    fenggeIndex,
    tiankuIndex,
    tianxuIndex,
    tianguanIndex,
    tianfuIndex,
    tiandeIndex,
    yuedeIndex,
    tiankongIndex,
    jieluIndex,
    kongwangIndex,
    xunkongIndex,
    tianshangIndex,
    tianshiIndex,
    jiekongIndex,
    jieshaAdjIndex,
    nianjieIndex,
    dahaoAdjIndex,
  };
};

/**
 * 获取年解的索引
 *
 * - 年解（按年支）
 *   - 解神从戌上起子，逆数至当生年太岁上是也
 *
 * @param earthlyBranch 地支（年）
 * @returns 年解索引
 */
export const getNianjieIndex = (earthlyBranchName: EarthlyBranchName) => {
  const earthlyBranch = kot<EarthlyBranchKey>(earthlyBranchName, 'Earthly');

  return fixIndex(
    fixEarthlyBranchIndex(
      ['xu', 'you', 'shen', 'wei', 'woo', 'si', 'chen', 'mao', 'yin', 'chou', 'zi', 'hai'][
        EARTHLY_BRANCHES.indexOf(earthlyBranch)
      ] as EarthlyBranchName,
    ),
  );
};
/**
 * 获取以月份索引为基准的星耀索引，包括解神，天姚，天刑，阴煞，天月，天巫
 * 解神分为年解和月解，月解作用更加直接快速，年解稍迟钝，且作用力没有月解那么大
 *
 * - 月解（按生月）
 *   - 正二在申三四在戍，五六在子七八在寅，九十月坐於辰宫，十一十二在午宫。
 *
 * - 安天刑天姚（三合必见）
 *   - 天刑从酉起正月，顺至生月便安之。天姚丑宫起正月，顺到生月即停留。
 *
 * - 安阴煞
 *   - 正七月在寅，二八月在子，三九月在戍，四十月在申，五十一在午，六十二在辰。
 *
 * - 安天月
 *   - 一犬二蛇三在龙，四虎五羊六兔宫。七猪八羊九在虎，十马冬犬腊寅中。
 *
 * - 安天巫
 *   - 正五九月在巳，二六十月在申，三七十一在寅，四八十二在亥。
 *
 * @param solarDate 阳历日期
 * @param timeIndex 时辰序号
 * @param fixLeap 是否修复闰月，假如当月不是闰月则不生效
 * @returns
 */
export const getMonthlyStarIndex = (solarDate: string, timeIndex: number, fixLeap?: boolean) => {
  const monthIndex = fixLunarMonthIndex(solarDate, timeIndex, fixLeap);

  const jieshenIndex = fixIndex(
    fixEarthlyBranchIndex(['shen', 'xu', 'zi', 'yin', 'chen', 'woo'][Math.floor(monthIndex / 2)] as EarthlyBranchName),
  );
  const tianyaoIndex = fixIndex(fixEarthlyBranchIndex('chou') + monthIndex);
  const tianxingIndex = fixIndex(fixEarthlyBranchIndex('you') + monthIndex);
  const yinshaIndex = fixIndex(
    fixEarthlyBranchIndex(['yin', 'zi', 'xu', 'shen', 'woo', 'chen'][monthIndex % 6] as EarthlyBranchName),
  );
  const tianyueIndex = fixIndex(
    fixEarthlyBranchIndex(
      ['xu', 'si', 'chen', 'yin', 'wei', 'mao', 'hai', 'wei', 'yin', 'woo', 'xu', 'yin'][
        monthIndex
      ] as EarthlyBranchName,
    ),
  );
  const tianwuIndex = fixIndex(
    fixEarthlyBranchIndex(['si', 'shen', 'yin', 'hai'][monthIndex % 4] as EarthlyBranchName),
  );

  return {
    yuejieIndex: jieshenIndex,
    tianyaoIndex,
    tianxingIndex,
    yinshaIndex,
    tianyueIndex,
    tianwuIndex,
  };
};

/**
 * 通过 大限/流年 天干获取流昌流曲
 *
 * - 流昌起巳位	甲乙顺流去
 * - 不用四墓宫	日月同年岁
 * - 流曲起酉位	甲乙逆行踪
 * - 亦不用四墓	年日月相同
 *
 * @param heavenlyStemName 天干
 * @returns 文昌、文曲索引
 */
export const getChangQuIndexByHeavenlyStem = (heavenlyStemName: HeavenlyStemName) => {
  let changIndex = -1;
  let quIndex = -1;
  const heavenlyStem = kot<HeavenlyStemKey>(heavenlyStemName, 'Heavenly');

  switch (heavenlyStem) {
    case 'jiaHeavenly':
      changIndex = fixIndex(fixEarthlyBranchIndex('si'));
      quIndex = fixIndex(fixEarthlyBranchIndex('you'));
      break;
    case 'yiHeavenly':
      changIndex = fixIndex(fixEarthlyBranchIndex('woo'));
      quIndex = fixIndex(fixEarthlyBranchIndex('shen'));
      break;
    case 'bingHeavenly':
    case 'wuHeavenly':
      changIndex = fixIndex(fixEarthlyBranchIndex('shen'));
      quIndex = fixIndex(fixEarthlyBranchIndex('woo'));
      break;
    case 'dingHeavenly':
    case 'jiHeavenly':
      changIndex = fixIndex(fixEarthlyBranchIndex('you'));
      quIndex = fixIndex(fixEarthlyBranchIndex('si'));
      break;
    case 'gengHeavenly':
      changIndex = fixIndex(fixEarthlyBranchIndex('hai'));
      quIndex = fixIndex(fixEarthlyBranchIndex('mao'));
      break;
    case 'xinHeavenly':
      changIndex = fixIndex(fixEarthlyBranchIndex('zi'));
      quIndex = fixIndex(fixEarthlyBranchIndex('yin'));
      break;
    case 'renHeavenly':
      changIndex = fixIndex(fixEarthlyBranchIndex('yin'));
      quIndex = fixIndex(fixEarthlyBranchIndex('zi'));
      break;
    case 'guiHeavenly':
      changIndex = fixIndex(fixEarthlyBranchIndex('mao'));
      quIndex = fixIndex(fixEarthlyBranchIndex('hai'));
      break;
  }

  return { changIndex, quIndex };
};
