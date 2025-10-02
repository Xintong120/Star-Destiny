import FunctionalStar from './FunctionalStar';

export const initStars = (): FunctionalStar[][] => [[], [], [], [], [], [], [], [], [], [], [], []];

// 使用新的模块化结构
export * from './modules';
export * from './majorStar';
export * from './minorStar';
export * from './adjectiveStar';
export * from './decorativeStar';
export * from './horoscopeStar';

// 保持向后兼容 - 如果需要，也可以同时导出原文件
// export * from './location';
