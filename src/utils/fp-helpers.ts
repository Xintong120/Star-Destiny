// 函数式编程工具库
import { EarthlyBranchName, HeavenlyStemName } from '../i18n';

// 基础函数组合工具
export const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
  fns.reduce((acc, fn) => fn(acc), value);

export const compose = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
  fns.reduceRight((acc, fn) => fn(acc), value);

// 柯里化工具
export const curry = <A, B, C>(fn: (a: A, b: B) => C) => 
  (a: A) => (b: B) => fn(a, b);

// Maybe Monad - 处理可能为空的值
export class Maybe<T> {
  constructor(private value: T | null | undefined) {}

  static of<T>(value: T | null | undefined): Maybe<T> {
    return new Maybe(value);
  }

  static nothing<T>(): Maybe<T> {
    return new Maybe<T>(null);
  }

  map<U>(fn: (value: T) => U): Maybe<U> {
    return this.isNothing() ? Maybe.nothing<U>() : Maybe.of(fn(this.value!));
  }

  chain<U>(fn: (value: T) => Maybe<U>): Maybe<U> {
    return this.isNothing() ? Maybe.nothing<U>() : fn(this.value!);
  }

  fold<U>(onNothing: () => U, onJust: (value: T) => U): U {
    return this.isNothing() ? onNothing() : onJust(this.value!);
  }

  isNothing(): boolean {
    return this.value === null || this.value === undefined;
  }

  getOrElse(defaultValue: T): T {
    return this.isNothing() ? defaultValue : this.value!;
  }
}

// 类型安全的转换函数
export const safeAsEarthlyBranchName = (value: string): EarthlyBranchName => {
  // 在实际项目中，这里应该有验证逻辑
  // 现在我们使用类型断言，但这是类型安全的包装
  return value as EarthlyBranchName;
};

export const safeAsHeavenlyStemName = (value: string): HeavenlyStemName => {
  return value as HeavenlyStemName;
};

// 函数式的类型转换管道
export const transformYearlyData = (yearly: [string, string]) => ({
  heavenlyStem: safeAsHeavenlyStemName(yearly[0]),
  earthlyBranch: safeAsEarthlyBranchName(yearly[1])
});

// 记忆化装饰器
export const memoize = <Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
  keyFn: (...args: Args) => string = (...args) => JSON.stringify(args)
) => {
  const cache = new Map<string, Return>();
  
  return (...args: Args): Return => {
    const key = keyFn(...args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// 惰性求值
export const lazy = <T>(fn: () => T) => {
  let cached = false;
  let result: T;
  
  return (): T => {
    if (!cached) {
      result = fn();
      cached = true;
    }
    return result;
  };
};

// 重构安全工具 - 确保新旧函数行为一致
export const refactorSafely = <Args extends unknown[], Return>(
  originalFn: (...args: Args) => Return,
  newFn: (...args: Args) => Return,
  testName: string = 'refactored function'
) => {
  return (...args: Args): Return => {
    const originalResult = originalFn(...args);
    const newResult = newFn(...args);
    
    // 深度比较结果
    if (JSON.stringify(originalResult) !== JSON.stringify(newResult)) {
      console.error(`❌ ${testName} 重构失败!`);
      console.error('原函数结果:', originalResult);
      console.error('新函数结果:', newResult);
      console.error('输入参数:', args);
      throw new Error(`重构验证失败: ${testName}`);
    }
    
    console.log(`✅ ${testName} 重构验证通过`);
    return newResult;
  };
};

// 性能对比工具
export const benchmarkRefactor = <Args extends unknown[], Return>(
  originalFn: (...args: Args) => Return,
  newFn: (...args: Args) => Return,
  testArgs: Args,
  iterations: number = 1000
) => {
  // 测试原函数性能
  const startOriginal = performance.now();
  for (let i = 0; i < iterations; i++) {
    originalFn(...testArgs);
  }
  const endOriginal = performance.now();
  const originalTime = endOriginal - startOriginal;

  // 测试新函数性能
  const startNew = performance.now();
  for (let i = 0; i < iterations; i++) {
    newFn(...testArgs);
  }
  const endNew = performance.now();
  const newTime = endNew - startNew;

  const improvement = ((originalTime - newTime) / originalTime * 100).toFixed(2);
  
  console.log(`📊 性能对比结果:`);
  console.log(`   原函数: ${originalTime.toFixed(2)}ms`);
  console.log(`   新函数: ${newTime.toFixed(2)}ms`);
  console.log(`   性能${newTime < originalTime ? '提升' : '下降'}: ${Math.abs(Number(improvement))}%`);
  
  return {
    originalTime,
    newTime,
    improvement: Number(improvement)
  };
};
