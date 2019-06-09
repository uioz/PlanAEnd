import { Middleware, RequestHaveLogger } from "../types";
import { globalDataInstance } from "../globalData";
import { code200 } from "../controllers/public";
import { responseMessage } from "../code";

export interface ReuqestHaveClientAccess extends RequestHaveLogger{
  clientAccess:{
    open:boolean;
    force:boolean;
    openTimeRange:{
      startTime:number;
      endTime:number;
    }
  }
}

/**
 * 获取服务端开启状态(数据保存在数据库中)中间件.
 * @param request 
 * @param response 
 * @param next 
 */
export const clientOpenFetchMiddleware: Middleware = (request: ReuqestHaveClientAccess,response,next)=>{

  (async (collection)=>{

    request.clientAccess = (await collection.findOne({}, { projection: { _id: false } }))['client'];

    return next();

  })(globalDataInstance.getMongoDatabase().collection('configuration_static'));

}

/**
 * 客户端开放中间件.
 * **注意**:注意该中间件依赖 request.clientAccess 属性
 * @param request 
 * @param response 
 * @param next 
 */
export const clientAccessControlMiddleware: Middleware = (request: ReuqestHaveClientAccess,response,next)=>{

  if(!request.clientAccess.open){
    code200(response,responseMessage['拒绝访问']);
    return;
  }

  if(request.clientAccess.force){
    return next();
  }

  const UnixTime = Date.now();

  if(UnixTime >= request.clientAccess.openTimeRange.startTime && UnixTime <= request.clientAccess.openTimeRange.endTime){
    return next();
  }else{
    code200(response, responseMessage['拒绝访问']);
    return;
  }

}