import { AddRoute, RequestHaveLogger } from "../types";
import { Router } from "express";
import { readOfApiState } from "../model/collectionRead";
import { responseAndTypeAuth, code500, logger500 } from "./public";
import { SystemErrorCode } from "../code";

/**
 * 简介:
 * 管理员登录后的欢迎页面的初始数据提供.
 * 提供一些服务器的基本信息.
 * 顶级URL为/api/state
 */

/**
 * 本模块使用的集合名称
 */
export const CollectionNames = ['configuration_static','model_users'];

/**
 * GET对应的权限下标(不需要权限)
 */
export const LevelIndexOfGet = '';

export const addRoute: AddRoute = ({ LogMiddleware, SessionMiddleware, verifyMiddleware }, globalDataInstance)=>{

  const 
    router = Router(),
    CollectionOfConfig = globalDataInstance.getMongoDatabase().collection(CollectionNames[0]),
    CollectionOfUsers = globalDataInstance.getMongoDatabase().collection(CollectionNames[1]);

  router.get('/api/state',SessionMiddleware,verifyMiddleware(LevelIndexOfGet),LogMiddleware,(request:RequestHaveLogger,response)=>{

    const account = request.session.account;

    readOfApiState(CollectionOfConfig,CollectionOfUsers,account).then((responseBody)=>{
      responseAndTypeAuth(response,{
        stateCode:200,
        message:responseBody
      });
    }).catch((error)=>{
      logger500(request.logger,undefined,SystemErrorCode['错误:数据库回调异常'],error);
      code500(response);
    });

  });

  return router;

}

