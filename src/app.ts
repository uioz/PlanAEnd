import { GlobalData, globalDataInstance } from "./globalData";
import * as Express from "express";
import { ServeStaticOptions } from 'serve-static'
import { resolve as PathResolve } from "path";
import { FinalErrorMiddleware,SetLogMiddleware } from "./middleware/error";
import { NotFoundMiddleware } from "./middleware/404";
import { LogMiddleware } from "./middleware/logger";
import Router from "./router";

/**
 * 服务器入口
 * @param Cwd 服务器工作路径
 * @param globalData 全局数据单例
 */
export default (Cwd: string, globalData: GlobalData) => {

    const
        App = Express(),
        Logger = globalData.getLogger(),
        SystemConfig = globalData.getConfig('configuration_static'),
        {
            server: {
                publicFilePath: serverPublicPath,
                port: serverPort,
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

    if (clientUrlPrefix === managementUrlPrefix) {
        Logger.error(`The 'clientUrlPrefix' cannot equal to 'managementUrlPrefix'.Please check your config and change them either.`);
        globalData.databaseClose();
    }

    // TODO 性能调优
    // TODO CSP
    // TODO release版本取消dev判断

    // 挂载路由
    Router(App,globalDataInstance);

    // see http://www.expressjs.com.cn/4x/api.html#express.static
    const staticOptions: ServeStaticOptions = {
        maxAge: '10d',
        immutable: true,
    };
    
    // 静态资源配置
    App.use(clientUrlPrefix, Express.static(PathResolve(Cwd, clientStaticPath), staticOptions)); // 客户端
    App.use(managementUrlPrefix, Express.static(PathResolve(Cwd, managementStaticPath), staticOptions));// 后端
    App.use('/public', Express.static(PathResolve(Cwd, serverPublicPath), staticOptions));// 公用

    // 非法请求
    App.use(LogMiddleware(Logger),NotFoundMiddleware);
    // 错误兜底
    App.use(SetLogMiddleware(Logger),FinalErrorMiddleware);

    App.listen(serverPort, () => Logger.info(`Server is listening port in ${serverPort}!`));

}