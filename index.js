// 手动 NODE_ENV
process.env.NODE_ENV = [...process.argv].splice(2,1)[0] || 'production';

/**
 * 方便在入口处打断点
 */
require('./dist/src/index.js').default(__dirname);