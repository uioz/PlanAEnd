import { AddRoute, RequestHaveLogger } from "../types";
import { Router } from "express";
import * as apiCheck from "api-check";
import { code500, logger500,responseAndTypeAuth, logger400, code400, code200 } from "./public";
import { SystemErrorCode,LevelCode } from "../code";
import { JSONParser } from "../middleware/jsonparser";

/**
 * 该类型用于描述资源操作中的JSON结构
 */
interface AssetsShape {
  /**
   * 应用名称
   */
  systemName?: string;
  /**
   * 客户端名称
   */
  clientName?: string;
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
  systemName: apiCheck.string.optional,
  clientName: apiCheck.string.optional,
  systemMessage: apiCheck.string.optional,
  clientMessage: apiCheck.string.optional,
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

      const data:AssetsShape = {
        systemName:result.appname.server,
        clientName:result.appname.client,
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

  router.post('/api/assets',SessionMiddleware,LogMiddleware,verify,JSONParser,(request:RequestHaveLogger,response)=>{

    const 
      requestBody: AssetsShape = request.body,
      checkedBody = assetsShape(requestBody);
    
    if (checkedBody instanceof Error){
      logger400(request.logger,request.body,undefined,checkedBody);
      return code400(response);
    }

    const data = {};
    
    if(requestBody.clientName){
      data['appname.client'] = requestBody.clientName;
    }

    if(requestBody.systemName){
      data['appname.server'] = requestBody.systemName;
    }

    if(requestBody.clientMessage){
      data['globalnotice.client'] = requestBody.clientMessage;
    }

    if(requestBody.systemMessage){
      data['globalnotice.client'] = requestBody.systemMessage;
    }

    if(Object.keys(data).length){
      colletion.updateOne({}, {
        $set: {
          ...data
        }
      }).catch(error => {
        logger500(request.logger, requestBody, SystemErrorCode['错误:数据库回调异常'], error);
      });
    }

    code200(response);

  });

  return router;
};