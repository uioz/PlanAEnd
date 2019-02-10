import { GlobalData } from "./globalData";
import * as  Express from "express";
import { ServeStaticOptions } from 'serve-static'
import { resolve as PathResolve } from "path";
import { LoggerMiddleware } from "./middleware/logger";

/**
 * 服务器入口
 * @param Cwd 服务器工作路径
 * @param globalData 全局数据单例
 */
export default (Cwd: string, globalData: GlobalData) => {

    const
        App = Express(),
        Logger = globalData.getLogger(),
        SystemConfig = globalData.getConfig('systemConfig'),
        {
            server: {
                pubicFilePath: serverPublicPath,
                port: serverPort,
            },
            system: {
                timezoneOffset
            },
            client: {
                clientStaticPath,
                clientUrlPrefix,
                managementStaticPath,
                managementUrlPrefix
            }
        } = SystemConfig;

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
    // TODO logger 中间件
    // TODO 404 中间件
    // TODO 替换所有的环境变量

    // see http://www.expressjs.com.cn/4x/api.html#express.static
    // 为了性能除了etag以及lastModified还设置10天的缓存且无视缓存内的资源请求
    const staticOptions: ServeStaticOptions = {
        maxAge: '10d',
        immutable: true,
    };
    
    // 静态资源配置
    App.use(clientUrlPrefix, Express.static(PathResolve(Cwd, clientStaticPath), staticOptions)); // 客户端
    App.use(managementUrlPrefix, Express.static(PathResolve(Cwd, managementStaticPath), staticOptions));// 后端
    App.use('/public', Express.static(PathResolve(Cwd, serverPublicPath), staticOptions));// 公用

    // 非法请求
    App.use((request, response) => response.end('404 Not Found'));

    App.use(/* 错误记录,错误中间件 */);

    

    App.listen(serverPort, () => Logger.info(`Server is listening port in ${serverPort}`));

}