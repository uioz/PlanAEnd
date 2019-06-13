import { Middleware } from "../types";
import { globalDataInstance } from "../globalData";
import { getConfigKeys } from "../model/collectionRead";
import { GetUserI } from "../helper/user";

/**
 * 获取控制范围的中间件, 当该中间件使用后会将该用户的管理范围作为一个字符串数组
 * 挂载到 request.controlArea 属性上
 * @param request 
 * @param response 
 */
export const controlAreaMiddleware: Middleware = (request,response,next)=>{

  (async ({userid,superUser},GetUserI,getConfigKeys,globalDataInstance)=>{

    // 获取专业模型结构上的第一层键, 用于提供给可以管理所有专业的用户和超级管理员
    let modelKeys = await getConfigKeys(globalDataInstance.getMongoDatabase().collection('model_speciality'));

    if (!superUser) {

      const normalUserControlArea = (await GetUserI().getInfo(userid))['controlarea'];
      // 如果不是可以管理所有专业的普通管理员
      // 则返回它所所管理的范围
      if(normalUserControlArea.length > 0){
        (request as any).controlArea = normalUserControlArea;
        return next();
      }

    }

    (request as any).controlArea = modelKeys;

    return next();

  })(request.session,GetUserI,getConfigKeys,globalDataInstance);

}