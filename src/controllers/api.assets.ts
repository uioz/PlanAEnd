import { AddRoute, RequestHaveLogger } from "../types";
import { Router } from "express";
import * as apiCheck from "api-check";
import { code500, logger500,responseAndTypeAuth, logger400, code400, code200 } from "./public";
import { SystemErrorCode,LevelCode } from "../code";
import { JSONParser } from "../middleware/jsonparser";
import * as DotProp from "dot-prop";

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

interface AssetsShapeForResponse extends Required<AssetsShape> {
  /**
   * logo
   */
  logo:string;
  /**
   * 客户端背景图片
   */
  clientBackground:string;
  /**
   * 服务端背景图片
   */
  systemBackground:string;
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
  
  // 获取服务器公开信息
  router.get('/api/assets', LogMiddleware, (request: RequestHaveLogger,response)=>{

    colletion.findOne({},{
      projection:{
        _id:0,
        appname:1,
        globalnotice:1,
        image:1
      }
    }).then((result)=>{

      const data: AssetsShapeForResponse = {
        systemName: DotProp.get(result, 'appname.server'),
        clientName: DotProp.get(result, 'appname.client'),
        systemMessage: DotProp.get(result, 'globalnotice.server'),
        clientMessage: DotProp.get(result, 'globalnotice.client'),
        systemBackground: DotProp.get(result, 'image.serverbackground'),
        clientBackground: DotProp.get(result, 'image.clientbackground'),
        logo: DotProp.get(result, 'image.logo'),
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

    // 避免空串返回false
    if(typeof requestBody.clientName === 'string'){
      data['appname.client'] = requestBody.clientName;
    }

    if(typeof requestBody.systemName === 'string'){
      data['appname.server'] = requestBody.systemName;
    }

    if(typeof requestBody.clientMessage === 'string'){
      data['globalnotice.client'] = requestBody.clientMessage;
    }

    if(typeof requestBody.systemMessage === 'string'){
      data['globalnotice.server'] = requestBody.systemMessage;
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