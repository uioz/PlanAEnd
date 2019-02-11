"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Express = require("express");
const path_1 = require("path");
const error_1 = require("./middleware/error");
const _404_1 = require("./middleware/404");
const logger_1 = require("./middleware/logger");
/**
 * 服务器入口
 * @param Cwd 服务器工作路径
 * @param globalData 全局数据单例
 */
exports.default = (Cwd, globalData) => {
    const App = Express(), Logger = globalData.getLogger(), SystemConfig = globalData.getConfig('systemConfig'), { server: { pubicFilePath: serverPublicPath, port: serverPort, }, system: { timezoneOffset }, client: { clientStaticPath, clientUrlPrefix, managementStaticPath, managementUrlPrefix } } = SystemConfig;
    Logger.debug('serverPort', serverPort);
    Logger.debug('serverPublicPath', serverPublicPath);
    Logger.debug('clientStaticPath', clientStaticPath);
    Logger.debug('clientUrlPrefix', clientUrlPrefix);
    Logger.debug('managementStaticPath', managementStaticPath);
    Logger.debug('managementUrlPrefix', managementUrlPrefix);
    const runingTimezone = new Date().getTimezoneOffset() / 60;
    if (runingTimezone !== parseInt(timezoneOffset)) {
        Logger.warn(`Time zone doesn't match! Need ${runingTimezone} but Get ${timezoneOffset}, Please configure your os timezone.`);
    }
    if (clientUrlPrefix === managementUrlPrefix) {
        Logger.error(`The 'clientUrlPrefix' cannot equal to 'managementUrlPrefix'.Please check your config and change them either.`);
        globalData.databaseClose();
    }
    // TODO set view engine
    // TODO 性能调优
    // TODO 测试异步解决方案,修复默认的error.ts的导出
    // see http://www.expressjs.com.cn/4x/api.html#express.static
    const staticOptions = {
        maxAge: '10d',
        immutable: true,
    };
    // 静态资源配置
    App.use(clientUrlPrefix, Express.static(path_1.resolve(Cwd, clientStaticPath), staticOptions)); // 客户端
    App.use(managementUrlPrefix, Express.static(path_1.resolve(Cwd, managementStaticPath), staticOptions)); // 后端
    App.use('/public', Express.static(path_1.resolve(Cwd, serverPublicPath), staticOptions)); // 公用
    // 非法请求
    App.use(logger_1.LogMiddleware, _404_1.NotFoundMiddleware);
    // 错误兜底
    App.use(error_1.SetLogMiddleware, error_1.FinalErrorMiddleware);
    App.listen(serverPort, () => Logger.info(`Server is listening port in ${serverPort}!`));
};
