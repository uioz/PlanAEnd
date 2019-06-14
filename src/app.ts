import * as History from "connect-history-api-fallback";
import * as Express from "express";
import { resolve as PathResolve } from "path";
import { ServeStaticOptions } from 'serve-static';
import { GlobalData, globalDataInstance } from "./globalData";
import { NotFoundMiddleware } from "./middleware/404";
import { FinalErrorMiddleware, SetLogMiddleware } from "./middleware/error";
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
        clientStaticPath, // 学生客户端文件保存地址
        clientUrlPrefix, // 学生客户端访问地址前缀
        managementStaticPath, // 管理客户端访问地址
        managementUrlPrefix // 管理客户端访问地址前缀
      },
      assets: {
        publicUrlPrefix
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
  Router(App, globalDataInstance);

  // see http://www.expressjs.com.cn/4x/api.html#express.static
  const staticOptions: ServeStaticOptions = {
    maxAge: '10d',
    immutable: true,
  };


  // 静态文件在前, 防止被客户端的正则匹配到
  App.use(publicUrlPrefix, Express.static(PathResolve(Cwd, serverPublicPath), staticOptions));

  App.use(History({
    rewrites:[
      {
        from: new RegExp(`^${managementUrlPrefix}`),
        to(content){
          // 非当前路径的请求直接返回
          if(content.parsedUrl.path.indexOf(managementUrlPrefix)!==0){
            return content.parsedUrl.path;
            // 如果含有.符号则返回源地址
          } else if (content.parsedUrl.pathname.lastIndexOf('.') > content.parsedUrl.pathname.lastIndexOf('/')){
            return content.parsedUrl.path;
          }else{
            // 返回首页
            return managementUrlPrefix;
          }
        }
      },
    ]
  }));

  //  静态资源配置
  App.use(managementUrlPrefix, Express.static(PathResolve(Cwd, managementStaticPath), staticOptions));// 后端
  App.use(clientUrlPrefix, Express.static(PathResolve(Cwd, clientStaticPath), staticOptions)); // 客户端

  // TODO 使用正则匹配然后进行跳转

  // 任何未被上述路由拦截的请求会被下方的路由处理
  // 被当做页面请求响应到客户端中
  // App.use(History({
  //   logger:Logger.debug.bind(Logger),
  //   rewrites: [
  //     {
  //       from: new RegExp(`^${managementUrlPrefix}`), // 监听不以 /api 开头的
  //       to: managementUrlPrefix
  //     },
  //     {
  //       from: new RegExp(`^${clientUrlPrefix}`), // 监听不以 /api 开头的
  //       to: clientUrlPrefix
  //     },
  //   ]
  // }));

  // 非法请求
  App.use(LogMiddleware(Logger), NotFoundMiddleware);
  // 错误兜底
  App.use(SetLogMiddleware(Logger), FinalErrorMiddleware);

  App.listen(serverPort, () => Logger.info(`Server is listening port in ${serverPort}!`));

}