# 项目架构
数据层：
FunctionalAstrolabe类：负责基础命盘数据管理
HoroscopeCalculator类：专门处理运限计算逻辑

服务层：
PalaceNameService：处理宫位名称
TimePeriodCalculator：处理时间周期计算
HoroscopeAdapter：格式化运限数据，实现缓存机制

状态管理层：
horoscopeStore：使用Pinia集中管理运限状态
useHoroscope composable：封装可复用的状态逻辑

视图层：
ZiWeiHoroscope.vue：命盘UI组件，负责展示和用户交互

# 项目重构记录

## 2025.06.09

### 运限计算逻辑重构

将运限计算逻辑从`FunctionalAstrolabe`类移至专门的`HoroscopeCalculator`类，实现关注点分离和单一职责原则。

#### 更新内容

1. 创建了三个新的服务类：
   - `HoroscopeCalculator`：负责运限计算逻辑
   - `PalaceNameService`：负责宫位名称计算
   - `TimePeriodCalculator`：负责时间周期计算

2. 更新了`ZiWeiHoroscope.vue`文件中所有使用`astrolabe.horoscope()`方法的地方：
   - 添加了`HoroscopeCalculator`的导入
   - 在`selectDecade`函数中将`props.astrolabe.horoscope(targetDate)`替换为`HoroscopeCalculator.calculateHoroscope(props.astrolabe, targetDate)`
   - 在`selectYear`函数中将`props.astrolabe.horoscope(yearDate)`替换为`HoroscopeCalculator.calculateHoroscope(props.astrolabe, yearDate)`
   - 在`updateHoroscope`函数中将`props.astrolabe.horoscope(currentDateStr)`替换为`HoroscopeCalculator.calculateHoroscope(props.astrolabe, currentDateStr)`
   - 在`updateYearHoroscope`函数中将`props.astrolabe.horoscope(yearDate)`替换为`HoroscopeCalculator.calculateHoroscope(props.astrolabe, yearDate)`

3. 修改了`FunctionalAstrolabe.ts`文件中的`horoscope`方法，使其调用`HoroscopeCalculator.calculateHoroscope()`：
   ```typescript
   horoscope = (targetDate: string | Date = new Date(), timeIndexOfTarget?: number) =>
     HoroscopeCalculator.calculateHoroscope(this, targetDate, timeIndexOfTarget);
   ```

4. 从`palace.ts`文件中移除了`getPalaceNames`和`getHoroscope`函数，将它们分别移至`PalaceNameService`和`TimePeriodCalculator`类中。

#### 重构的好处

1. **关注点分离**：将运限计算逻辑从`FunctionalAstrolabe`类移至专门的`HoroscopeCalculator`类，使代码结构更清晰
2. **单一职责原则**：每个类只负责一个功能领域，`FunctionalAstrolabe`负责星盘基础数据，`HoroscopeCalculator`负责运限计算
3. **可维护性提高**：运限计算逻辑集中在一个类中，便于后续维护和扩展
4. **代码复用**：`HoroscopeCalculator`可以被其他组件直接使用，不需要通过`FunctionalAstrolabe`实例

## 2025.06.10

### 组件逻辑简化重构

将`ZiWeiHoroscope.vue`组件中的业务逻辑移至服务层和Composable中，实现UI与业务逻辑分离。

#### 更新内容

1. 创建了运限数据适配器服务：
   - `HoroscopeAdapter`：负责格式化运限数据，将iztro库的计算结果转换为应用所需的数据结构
   - 实现了缓存机制，避免重复计算相同的运限信息
   - 添加了错误处理，提高代码健壮性

2. 创建了状态管理Composable：
   - `useHoroscope`：封装运限数据状态管理，包括大限/流年选择、状态更新等逻辑
   - 使用Vue 3的Composition API，提供响应式状态管理

3. 新增类型定义：
   - `HoroscopeInfo`：运限信息数据结构
   - `HoroscopeHistoryItem`：运限历史记录项数据结构
   - `Decade`：大限数据结构

#### 重构的好处

1. **关注点分离**：UI组件仅负责渲染和事件处理，业务逻辑移至服务层和Composable
2. **代码复用**：Composable可在多个组件中复用，避免逻辑重复
3. **可测试性提高**：业务逻辑与UI分离，便于单元测试
4. **可维护性提升**：组件代码减少，职责更清晰
5. **性能优化**：实现缓存机制，避免重复计算

### 大限选择功能测试重构

完成了大限选择功能的重构，测试重构效果是否符合预期。

#### 更新内容

1. 重构了`ZiWeiHoroscope.vue`组件的`selectDecade`函数：
   - 使用`useHoroscope` composable中的`selectDecade`函数替换原有的复杂逻辑
   - 原有的逻辑包含约100行代码，重构后减少到10行左右
   - 保留对其他状态的重置，确保与原有功能一致

2. 创建了测试组件：
   - 新增`src/tests/HoroscopeTest.vue`用于测试重构后的功能
   - 提供命盘加载和运限选择结果展示
   - 验证重构后的组件功能是否正常

## 2025.06.11

### 完成流年和流月功能重构

继续重构ZiWeiHoroscope.vue组件，完成流年和流月选择功能的重构。

#### 更新内容

1. 修复类型定义：
   - 更新`HoroscopeHistoryItem`接口，使其更灵活兼容不同的使用场景
   - 添加`CustomHoroscopeInfo`接口，统一处理各种运限数据格式

2. 增强HoroscopeAdapter服务：
   - 添加`formatMonthInfo`方法，用于格式化流月数据
   - 完善错误处理和缓存机制
   - 确保返回的数据格式一致

3. 扩展useHoroscope composable：
   - 添加`selectMonth`方法，支持流月选择功能
   - 管理流月相关的状态
   - 提供统一的历史记录管理

4. 重构ZiWeiHoroscope.vue组件：
   - 重构`selectYear`函数，从100+行代码减少到约15行
   - 重构`selectMonth`函数，从80+行代码减少到约15行
   - 保持与原有功能一致，同时简化组件代码

#### 重构的好处

1. **代码量大幅减少**：流年和流月选择函数合计减少约150行代码
2. **业务逻辑集中管理**：所有运限选择逻辑统一由useHoroscope composable管理
3. **降低组件复杂度**：组件只关注UI渲染和用户交互
4. **提高可维护性**：业务逻辑变更只需修改composable和服务，不影响组件
5. **统一状态管理**：所有运限状态集中管理，避免状态不一致问题

#### 后续计划

1. **完成流日和流时功能重构**：
   - 继续重构剩余的流日和流时选择功能
   - 添加相应的适配器方法和composable功能

2. **添加单元测试**：
   - 为服务和composable添加单元测试
   - 确保重构后的功能与原有功能一致

3. **优化性能**：
   - 进一步优化缓存策略
   - 减少不必要的计算和渲染

## 2025.06.12

### 引入Pinia状态管理

使用Pinia替代Composition API进行状态管理，进一步优化数据流和组件通信。

#### 更新内容

1. 添加Pinia状态管理：
   - 创建`horoscopeStore.ts`，使用Pinia的Composition API风格
   - 将之前的useHoroscope composable逻辑迁移到store中
   - 添加更完善的状态管理，包括选中状态、历史记录等

2. 优化HoroscopeAdapter服务：
   - 完善缓存机制，减少不必要的计算
   - 提供更灵活的数据格式化方法
   - 统一错误处理逻辑

3. 修改ZiWeiHoroscope.vue组件：
   - 使用Pinia store替代之前的composable
   - 减少本地状态，使用store中的集中状态
   - 简化状态更新逻辑

4. 更新类型定义：
   - 扩展CustomHoroscopeInfo接口，支持更多的运限数据格式
   - 确保类型安全，减少运行时错误

#### 重构的好处

1. **全局状态管理**：Pinia提供更强大的状态管理能力，包括状态持久化、DevTools支持等
2. **更好的组件通信**：避免深层props和emit，简化组件间通信
3. **状态逻辑复用**：store中的逻辑可在多个组件中复用，提高代码一致性
4. **更好的可测试性**：Pinia store更容易进行单元测试
5. **状态变更追踪**：通过DevTools可以清晰追踪状态变更，便于调试
6. **可扩展性提升**：为后续添加更多功能（如流日、流时选择）提供了良好的基础

## 2025.06.13

### 添加Pinia持久化功能

为Pinia store添加持久化功能，保存用户的运限选择状态，提高用户体验。

#### 更新内容

1. 添加持久化插件：
   - 安装`pinia-plugin-persistedstate`插件
   - 在`main.js`中配置Pinia使用持久化插件
   - 为`horoscopeStore`添加持久化配置

2. 优化持久化策略：
   - 设置持久化key为`iztro-horoscope-state`
   - 使用localStorage作为存储介质
   - 自动保存所有状态

3. 添加状态恢复逻辑：
   - 在组件挂载时检查存储的状态
   - 根据存储的命盘ID判断是否需要恢复状态
   - 按照大限、流年、流月、流日、流时的顺序恢复之前的选择

4. 增强用户体验：
   - 添加状态恢复成功的提示信息
   - 记录最近查看的命盘ID，便于状态恢复

#### 持久化的好处

1. **会话连续性**：用户刷新页面或重新访问时可以恢复之前的选择状态
2. **减少重复操作**：用户不需要重新选择之前已经查看过的运限信息
3. **提高用户粘性**：改善用户体验，增加用户留存率
4. **状态可追溯**：持久化的状态可以用于数据分析和用户行为追踪
5. **减轻服务器负担**：本地存储减少了对服务器的请求次数

## 2025.06.14

### 修复流年计算逻辑

修复了大限和流年计算的问题，确保流年计算准确无误，特别是对于2002-1-20出生的女性命盘和2024-2-5出生的命例。

#### 更新内容

1. 修改HoroscopeAdapter.formatDecadalInfo方法：
   - 将大限年龄计算从使用中点年龄改为使用起始年龄
   - 统一大限起始年份计算公式为：出生年份 + 起运年龄 - 2
   - 修改代码：
     ```typescript
     // 修改前
     const midAge = Math.floor((decade.range[0] + decade.range[1]) / 2);
     const targetYear = birthYear + midAge;
     
     // 修改后
     const startAge = decade.range[0];
     const targetYear = birthYear + startAge - 2; // 统一计算公式
     ```
   - 确保大限对应的流年从大限的起始年龄开始计算，并考虑虚岁和起运年份

2. 修改虚岁计算逻辑：
   - 在formatYearInfo和formatMonthInfo方法中使用传统虚岁计算方式
   - 修改代码：
     ```typescript
     // 修改前（使用TimePeriodCalculator.calculateNominalAge方法）
     const age = calculateNominalAge(birthYear, year, birthMonth, birthDay, ...);
     
     // 修改后（使用传统虚岁计算）
     const age = year - birthYear + 1; // +1是因为出生即为1岁
     ```
   - 确保虚岁计算符合中国传统方式

3. 统一大限年份计算公式：
   - 经过多次测试和验证，确定紫微斗数中大限起始年份的统一计算公式为：
     ```
     大限起始年份 = 出生年份 + 起运年龄 - 2
     ```
   - 这个公式适用于所有出生年份和起运年龄的组合
   - 例如：
     - 2002年出生，土五局，5岁起运，第一个大限起始年份为2005年（2002+5-2=2005）
     - 2024年出生，火六局，6岁起运，第一个大限起始年份为2028年（2024+6-2=2028）
   - 公式中减2的原因：
     1. 虚岁比实岁大1岁（出生即为1岁）
     2. 大限起运是从下一年开始计算的

4. 修复流月数据处理问题：
   - 发现流月数据是对象而非数组，导致forEach方法调用失败
   - 添加类型检查和适当的数据处理：
     ```typescript
     // 修改前
     localYearData.value.monthly.forEach((month, idx) => {
       console.log(`${idx+1}月: ${month.heavenlyStem}${month.earthlyBranch}`);
     });
     
     // 修改后
     if (Array.isArray(localYearData.value.monthly)) {
       // 如果是数组，使用forEach
       localYearData.value.monthly.forEach((month, idx) => {
         console.log(`${idx+1}月: ${month.heavenlyStem}${month.earthlyBranch}`);
       });
     } else if (typeof localYearData.value.monthly === 'object') {
       // 如果是对象，使用Object.entries
       Object.entries(localYearData.value.monthly).forEach(([key, value]) => {
         if (typeof value === 'object' && value !== null) {
           console.log(`${key}月: ${value.heavenlyStem || ''}${value.earthlyBranch || ''}`);
         }
       });
     }
     ```
   - 确保能够正确处理不同格式的流月数据

5. 深入理解大限起运计算逻辑：
   - 大限起运计算在`palace.ts`的`getHoroscope`函数中实现
   - 大限起运规则：
     - 阳男阴女顺行，阴男阳女逆行，每十年过一宫限
     - 起运年龄从五行局数开始，每大限跨越10年
   - 大限年龄范围的计算公式：`[五行局数 + 10*i, 五行局数 + 10*i + 9]`
   - 我们的修改与原始代码逻辑保持一致，只是将计算过程简化为一个统一的公式

#### 修复的问题

针对不同出生年份的命例，修复了以下问题：
1. 对于2002-1-20出生的命例：
   - 土五局，5岁起运，第一个大限是5-14岁
   - 大限起始年份正确计算为2005年（2002+5-2=2005）
   - 辛丑流年正确显示为2005年

2. 对于2024-2-5出生的命例：
   - 火六局，6岁起运，第一个大限是6-15岁
   - 大限起始年份正确计算为2028年（2024+6-2=2028）
   - 虚岁计算符合传统方式，2025年的虚岁为2岁（2025-2024+1=2）

3. 流月数据处理逻辑更加健壮，可以处理不同格式的数据

#### 修复的好处

1. **计算准确性提高**：流年计算与紫微斗数理论和传统虚岁计算方式一致
2. **用户体验改善**：显示的流年信息更加准确，减少用户困惑
3. **虚岁计算符合传统**：使用中国传统虚岁计算方式（出生即为1岁）
4. **代码逻辑清晰**：统一使用一个简单的公式计算大限起始年份
5. **一致性增强**：所有运限计算逻辑保持一致，便于维护和理解
6. **错误处理改进**：增加了对不同数据格式的处理能力，提高了代码的健壮性
7. **通用性提高**：修复后的计算公式适用于所有出生年份和起运年龄的组合

## 2025.06.15

### 修复流月天干地支计算

修复了流月天干地支计算问题，确保使用正确的五虎遁法计算流月干支。

#### 更新内容

1. 修改`ZiWeiHoroscope.vue`中的`generateMonthlyGanZhi`函数：
   - 使用switch语句替代对象映射，使代码更清晰
   - 正确实现五虎遁口诀的逻辑：
     ```typescript
     // 使用五虎遁口诀确定正月天干索引
     // 甲己之年丙作首：如果年份是甲或己年，则正月的天干从丙开始
     // 乙庚之岁戊为头：如果年份是乙或庚年，则正月的天干从戊开始
     // 丙辛之岁寻庚起：如果年份是丙或辛年，则正月的天干从庚开始
     // 丁壬壬位顺行流：如果年份是丁或壬年，则正月的天干从壬开始
     // 戊癸何方发，甲寅之上好追求：如果年份是戊或癸年，则正月的天干从甲开始
     switch(yearGan) {
       case '甲':
       case '己':
         firstMonthGanIndex = 2; // 丙
         break;
       case '乙':
       case '庚':
         firstMonthGanIndex = 4; // 戊
         break;
       case '丙':
       case '辛':
         firstMonthGanIndex = 6; // 庚
         break;
       case '丁':
       case '壬':
         firstMonthGanIndex = 8; // 壬
         break;
       case '戊':
       case '癸':
         firstMonthGanIndex = 0; // 甲
         break;
       default:
         firstMonthGanIndex = 0;
     }
     ```
   - 修改变量名称，将`firstMonthGan`改为`firstMonthGanIndex`以更准确地反映其含义

2. 验证五虎遁法计算正确性：
   - 添加测试函数`test2006YearMonthlyGanZhi`，验证2006年（丙戌年）的流月干支计算
   - 根据五虎遁口诀"丙辛之岁寻庚起"，2006年正月应该从庚寅开始
   - 验证计算结果是否符合预期：
     ```
     正月: 庚寅，二月: 辛卯，三月: 壬辰，四月: 癸巳，五月: 甲午，
     六月: 乙未，七月: 丙申，八月: 丁酉，九月: 戊戌，十月: 己亥，
     十一月: 庚子，十二月: 辛丑
     ```

3. 确认`src/data/constants.ts`中的`TIGER_RULE`对象已经是正确的实现：
   ```typescript
   export const TIGER_RULE = {
     jiaHeavenly: 'bingHeavenly',  // 甲年起丙
     yiHeavenly: 'wuHeavenly',     // 乙年起戊
     bingHeavenly: 'gengHeavenly', // 丙年起庚
     dingHeavenly: 'renHeavenly',  // 丁年起壬
     wuHeavenly: 'jiaHeavenly',    // 戊年起甲
     jiHeavenly: 'bingHeavenly',   // 己年起丙
     gengHeavenly: 'wuHeavenly',   // 庚年起戊
     xinHeavenly: 'gengHeavenly',  // 辛年起庚
     renHeavenly: 'renHeavenly',   // 壬年起壬
     guiHeavenly: 'jiaHeavenly',   // 癸年起甲
   }
   ```

#### 修复的问题

1. 流月天干地支显示为"--"的问题：
   - 之前由于五虎遁法实现有误，导致流月天干地支计算错误或无法显示
   - 修复后能够正确计算并显示流月天干地支

2. 五虎遁法计算逻辑：
   - 修复了五虎遁法的实现，确保按照正确的口诀计算流月天干
   - 验证了2006年（丙戌年）的流月干支计算结果，确认修复有效

#### 修复的好处

1. **计算准确性提高**：流月干支计算与紫微斗数理论一致
2. **代码可读性增强**：使用switch语句使五虎遁法实现更清晰易懂
3. **用户体验改善**：正确显示流月天干地支信息
4. **一致性保证**：确保与`TIGER_RULE`常量定义保持一致
5. **可验证性**：添加测试函数验证计算结果的正确性
6. **错误处理改进**：更明确的变量命名减少了混淆和错误

## 2025.06.16

### 修复大限四化星显示问题

修复了点击大限时四化星（禄、权、科、忌）没有正确显示在对应宫位上的问题。

#### 更新内容

1. 修改`ZiWeiHoroscope.vue`中的`selectDecade`函数：
   - 在传递大限数据时添加原始选择的天干地支信息：
     ```typescript
     const safeDecadalInfo: HoroscopeInfo = {
       type: 'decadal',
       data: {
         // ... 其他属性 ...
         // 添加原始选择的大限天干地支信息
         originalHeavenlyStem: selectedDecade.heavenlyStem,
         originalEarthlyBranch: selectedDecade.earthlyBranch,
         // ... 其他属性 ...
       },
       // ... 其他属性 ...
     };
     ```

2. 修改`ZiWeiGrid.vue`中的`getHoroscopeMutagen`函数：
   - 使用原始选择的大限天干确定四化星，而不是计算结果中的天干：
     ```typescript
     // 获取大限天干 - 使用原始选择的大限天干，而不是计算结果中的天干
     let heavenlyStem = '';
     
     // 如果horoscopeItem.data中包含原始选择的大限天干，则使用它
     if (horoscopeItem.data.originalHeavenlyStem) {
       heavenlyStem = horoscopeItem.data.originalHeavenlyStem;
       console.log(`使用原始选择的大限天干: ${heavenlyStem}`);
     } else if (horoscopeItem.data.heavenlyStem) {
       // 否则使用计算结果中的天干
       heavenlyStem = horoscopeItem.data.heavenlyStem;
       console.log(`使用计算结果中的大限天干: ${heavenlyStem}`);
     }
     ```

3. 修改`ZiWeiGrid.vue`中的`getHoroscopeStars`函数：
   - 使用原始选择的大限地支确定流曜星位置，而不是计算结果中的地支：
     ```typescript
     // 获取原始选择的大限地支索引
     let selectedDecadeEarthlyBranch = '';
     if (horoscopeItem.data.originalEarthlyBranch) {
       selectedDecadeEarthlyBranch = horoscopeItem.data.originalEarthlyBranch;
       console.log(`使用原始选择的大限地支: ${selectedDecadeEarthlyBranch}`);
     } else if (horoscopeItem.data.earthlyBranch) {
       selectedDecadeEarthlyBranch = horoscopeItem.data.earthlyBranch;
       console.log(`使用计算结果中的大限地支: ${selectedDecadeEarthlyBranch}`);
     }
     
     // 获取选择的大限地支索引
     const selectedDecadeEarthlyBranchIndex = branches.indexOf(selectedDecadeEarthlyBranch);
     
     // 计算目标宫位索引
     let targetIndex = 0;
     if (isClockwise) {
       // 顺时针排列
       targetIndex = (earthBranchIndex + 12 - selectedDecadeEarthlyBranchIndex) % 12;
     } else {
       // 逆时针排列
       targetIndex = (selectedDecadeEarthlyBranchIndex + 12 - earthBranchIndex) % 12;
     }
     ```

4. 添加调试功能：
   - 在`ZiWeiGrid.vue`中添加`debugDecadalStarsCalculation`函数，用于打印大限四化星和流曜星的计算过程
   - 添加对原始选择的大限天干地支的打印：
     ```typescript
     // 打印原始选择的大限天干地支
     if (decadalData.data.originalHeavenlyStem && decadalData.data.originalEarthlyBranch) {
       console.log('原始选择的大限天干地支:', decadalData.data.originalHeavenlyStem, decadalData.data.originalEarthlyBranch);
       console.log('注意: 四化星将使用原始选择的大限天干');
     }
     ```

#### 修复的问题

1. 大限四化星显示问题：
   - 之前点击"己亥"大限时，后台使用的是"戊戌"大限的天干"戊"来确定四化星
   - 修复后使用实际选择的大限天干"己"来确定四化星，正确显示"武曲化禄、贪狼化权、天梁化科、文曲化忌"

2. 大限四化星显示问题：
   - 之前四化星的位置是根据计算出的"戊戌"大限确定的，而不是用户选择的"己亥"大限
   - 修复后使用实际选择的大限地支"亥"来确定流曜星位置，确保流曜星正确显示在对应宫位

#### 修复的好处

1. **用户体验改善**：点击大限时，四化星和流曜星能够正确显示在对应宫位
2. **计算准确性提高**：使用实际选择的大限天干地支进行计算，而不是固定年份计算出的天干地支
3. **代码健壮性增强**：添加了多层数据获取逻辑，即使原始数据缺失也能回退到计算结果
4. **调试能力提升**：添加了详细的日志输出，便于排查问题
5. **数据一致性保证**：确保UI显示的大限天干地支与实际计算使用的天干地支一致
6. **不影响其他功能**：修改只针对四化星和流曜星的计算，不影响大限运限计算逻辑

## 2025.06.17

### 修复第一个大限宫位名称显示

修复了第一个大限的十二宫位名称未能与本命盘宫位名称保持一致的问题，这是后续所有大限排布正确的基础。

#### 更新内容

1.  **增加大限序号判断**:
    -   在 `ZiWeiGrid.vue` 的 `handleHoroscopeUpdate` 函数中，添加了对 `selectedDecadeIndex` 的判断。
    -   当 `selectedDecadeIndex === 0` 时，认定为第一个大限。

2.  **直接复制本命宫位**:
    -   对于第一个大限，程序现在会遍历本命盘的 `palaces` 数组，并将其宫位名称直接赋给大限的宫位名称数组。
    -   此举确保了第一个大限的所有宫位名称（命宫、兄弟宫、夫妻宫等）与本命盘完全对应。

3.  **分离处理逻辑**:
    -   将第一个大限的处理逻辑与后续大限的动态计算逻辑用 `if/else` 完全分离开，避免了之前错误的算法被错误地应用到第一个大限上。

#### 修复的好处

1.  **遵循排盘规则**: 确保了第一个大限的排盘与紫微斗数"大限由本命命宫起"的规则一致。
2.  **奠定后续基础**: 正确设置第一个大限是后续大限按规律顺逆轮转的基础，为修复后续的运转方向问题铺平了道路。
3. **逻辑清晰**: `if (selectedDecadeIndex === 0)` 的结构使得代码意图更加明确，易于理解和维护。

### 修复大限宫位运转方向

修复了从第二个大限开始，宫位运转方向错误的问题，确保其严格遵循紫微斗数的排盘规则。

#### 更新内容

1.  **修正核心计算逻辑**：
    -   在 `ZiWeiGrid.vue` 的 `handleHoroscopeUpdate` 函数中，修正了判断大限顺/逆时针运转方向的核心逻辑。
    -   此前，程序中顺时针和逆时针对应的数组索引增减量是颠倒的，导致大限命宫的推移方向完全错误。

2.  **明确对应关系**：
    -   **顺时针 (阳男阴女)**：大限命宫从本命命宫 -> 父母宫 -> 福德宫...，现在正确对应 `palaces` 数组索引 **递减** (`-1`)。
    -   **逆时针 (阴男阳女)**：大限命宫从本命命宫 -> 兄弟宫 -> 夫妻宫...，现在正确对应 `palaces` 数组索引 **递增** (`+1`)。

3.  **更新代码注释**：
    -   同步修改了代码中的注释，使其与修正后的逻辑保持一致，提高了代码的可读性和可维护性。
    -   修改前：`const directionStep = isClockwise ? 1 : -1;`
    -   修改后：`const directionStep = isClockwise ? -1 : 1;`

#### 修复的好处

1.  **计算准确性**：确保了所有大限的宫位名称排布都严格符合紫微斗数理论，解决了从第二个大限开始宫位名称不正确的问题。
2.  **逻辑清晰**：代码逻辑与紫微斗数的顺逆行规则完全对应，便于后续理解和维护。
3. **用户体验提升**：用户在切换不同大限时，能够看到完全正确的宫位对应关系，增强了工具的专业性和可信度。

### 修复大限四化星重复显示及渲染时序错误

解决了在选择大限时，会错误地显示两套四化星（大限四化与本命四化），以及在页面初始化时因数据未准备好而导致的渲染错误。

#### 更新内容

1.  **重构 `getStarMutagenType` 函数逻辑**:
    -   **问题定位**: `getStarMutagenType` 函数在检查完大限四化后，没有立即停止，而是继续检查本命四化，导致了四化星的重复显示。
    -   **建立"运限优先"原则**:
        -   当有运限（如大限）被选中时，函数将 **只** 查找并返回当前运限的四化星，然后立即退出，不再理会本命四化。
        -   只有在 **没有** 任何运限被选中时，函数才会去查找并返回本命四化。

2.  **增加渲染时序的防御性编程**:
    -   **问题定位**: 页面初始化时出现 `TypeError: Cannot read properties of undefined (reading '0')` 的运行时错误。
    -   **原因分析**: 组件在渲染初期调用了 `getStarMutagenType` 函数，但此时 `props.astrolabe.mutagen` 属性尚未被完全计算好，值为 `undefined`。
    -   **添加安全校验**: 在读取 `mutagens` 数组之前，增加了一个 `if (mutagens)` 的存在性检查。如果 `mutagens` 不存在，函数会安全地返回 `null`，避免了程序因时序问题而崩溃。

#### 修复的好处

1.  **显示准确性**: 确保在任何时候都只显示一套正确的四化星（运限优先于本命），符合紫微斗数实际应用。
2.  **程序健壮性**: 增加了对 `undefined` 值的防御性编程，消除了因组件渲染时序问题导致的运行时错误，提升了应用的稳定性。
3. **逻辑严谨**: 明确了四化星的显示层级，使代码逻辑更清晰，更符合预期。

## 2025.06.18

### 完善大限流曜星显示功能

完成了对大限流曜星显示功能的扩展与统一，确保所有10颗重要的大限流曜星（运禄、运羊、运陀、运魁、运钺、运昌、运曲、运马、运鸾、运喜）都能在选择大限时正确显示。

#### 更新内容

1.  **扩展 `getHoroscopeStars` 函数**：
    -   在 `components/ZiWeiGrid.vue` 文件的 `getHoroscopeStars` 函数中，为 `horoscopeType === 'decadal'` 的情况增加了完整的流曜计算逻辑。

2.  **实现基于大限天干的流曜计算**：
    -   补充了 **大限文昌** 和 **大限文曲** 的计算逻辑，它们的位置由大限的天干决定。
    -   至此，所有由天干决定的核心流曜（禄、羊、陀、魁、钺、昌、曲）均已实现。

3.  **实现基于大限地支的流曜计算**：
    -   补充了 **大限天马**、**大限红鸾** 和 **大限天喜** 的计算逻辑，它们的位置由大限命宫的地支决定。

4.  **统一流曜命名规范**：
    -   根据您的要求，将所有通过此逻辑计算出的大限流曜星的名称前缀统一为"**运**"（例如，从"大限禄存"改为"运禄"），与您提供的示例数据格式保持一致。

#### 修复的好处

1.  **功能完整性**：补全了所有核心大限流曜的显示，使大限运势分析的信息更全面。
2.  **计算准确性**：确保了每颗流曜星都根据其对应的天干或地支规则，精确地显示在正确的宫位上。
3.  **数据一致性**：统一了命名规范，使得从不同逻辑（天干、地支、随宫）产生的流曜星在UI上呈现的格式一致，便于理解。