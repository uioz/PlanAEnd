/**
 * 为什么要这么做?
 * 在TypeScript中引入其他的非node_modules目录下的模块非常困难
 * 我原来需要这个文件的ts版本中引入在lib和config目录下的模块
 * 但是这些模块是已经构建完成的了,之所以放在了lib和config目录中是因为这些模块
 * 是我编写的而且没有上传到Npm上,放到lib和config中容易区分.
 * 
 * 但是如果在这个文件的位置定义一个index.ts文件该文件会输出到dist目录中,当我要引入模块的时候
 * import xxx from './lib'(index.ts -- ./dist)是无法引入lib下的模块的,因为在运行的时候dist目录下没有
 * lib文件夹.
 * 而且TypeScript中使用`/lib/xxx`的写法也是无效的,
 * 使用虚拟Root和baseUrl只能解决引入模块的问题在运行的时候的引入文件路径不会修改.
 * 所以使用这里定义的index.js来调用由TypeScript编写的入口文件,在src目录下的路径和dist运行时保持了一致
 */
require('./dist/src/index.js').default(__dirname);

// TODO 检测传入参数