import { AddRoute, RequestHaveLogger } from "../types";
import { Router } from "express";
import * as apiCheck from "api-check";
import { code500, logger500 } from "./public";
import { SystemErrorCode,LevelCode } from "../code";


/**
 * 该类型用于描述资源操作中的JSON结构
 */
interface assetsShape {
  /**
   * 应用名称
   */
  appname?: string;
  /**
   * 客户端名称
   */
  clientname?: string;
  /**
   * 应用首屏消息
   */
  appmessage?: string;
  /**
   * 客户端首屏消息
   */
  clientmessage?: string;
}

/**
 * 定义资源请求/获取 数据结构验证模板
 */
const assetsShape = apiCheck.shape({
  appname: apiCheck.string.optional,
  clientname: apiCheck.string.optional,
  appmessage: apiCheck.string.optional,
  clientmessage: apiCheck.string.optional,
}).strict;

export const addRoute:AddRoute = ({LogMiddleware,SessionMiddleware,verifyMiddleware},globalData)=>{

  const 
    router = Router(),
    collectionName = 'model_assets',
    colletion = globalData.getMongoDatabase().collection(collectionName),
    assetsLevelCode = LevelCode.StaticMessageIndex.toString(),
    verify = verifyMiddleware(assetsLevelCode);
    
  router.get('/api/assets', SessionMiddleware, LogMiddleware, verify, (request: RequestHaveLogger,response)=>{

    colletion.findOne({},{
      projection:{
        _id:0,
        appname:1,
        globalnotice:1
      }
    }).then((result)=>{
      debugger
      console.log(result);
    }).catch((error) =>{
      logger500(request.logger,undefined,SystemErrorCode['错误:数据库读取错误'],error);
      code500(response);
    });

  });


  return router;
};