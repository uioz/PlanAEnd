import { AddRoute, RequestHaveLogger } from "../types";
import { Router } from "express";
import * as apiCheck from "api-check";
import { code500, logger500,responseAndTypeAuth } from "./public";
import { SystemErrorCode,LevelCode } from "../code";
import { JSONParser } from "../middleware/jsonparser";

/**
 * 该类型用于描述资源操作中的JSON结构
 */
interface assetsShape {
  /**
   * 应用名称
   */
  systemName?: string;
  /**
   * 客户端名称
   */
  clientname?: string;
  /**
   * 应用首屏消息
   */
  systemMessage?: string;
  /**
   * 客户端首屏消息
   */
  clientMessage?: string;
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

      const data:assetsShape = {
        systemName:result.appname.server,
        clientname:result.appname.client,
        systemMessage: result.globalnotice.server,
        clientMessage:result.globalnotice.client
      };

      responseAndTypeAuth(response,{
        stateCode:200,
        data,
        message:''
      });
      
    }).catch((error) =>{
      logger500(request.logger,undefined,SystemErrorCode['错误:数据库读取错误'],error);
      code500(response);
    });

  });

  router.post('/api/assets',)

  return router;
};