import { AddRoute, RequestHaveLogger, Middleware } from "../types";
import { Router } from "express";
import { LevelCode } from "../utils/privilege";
import { responseAndTypeAuth, code500, logger500, logger400, code400 } from "./public"
import { JSONParser } from "../middleware/jsonparser";
import * as apiCheck from "api-check";
import { SystemErrorCode, responseMessage } from "../code";
import { globalDataInstance } from "../globalData";
import sha1 from "sha1";

/**
 * 该接口描述了POST请求用户传递内容数据的类型
 */
interface PostShape {
  /**
   * 账户名称
   */
  account: string;
  /**
   * 用户昵称
   */
  nickname?: string;
  /**
   * 用户权限2进制转10进制数值
   * 由于一共有6个权限位,所以二进制111111十进制表示63
   * 所以该数值被限制在了1-63闭区间中
   */
  level?: number;
  /**
   * 密码SHA1格式
   */
  password?: string;
  /**
   * 所管理的顶级字段
   */
  controlarea?: Array<string>;
}

export const addRoute: AddRoute = ({ LogMiddleware, SessionMiddleware, verifyMiddleware }, globalData) => {

  const
    router = Router(),
    collectionName = 'model_users',
    collection = globalData.getMongoDatabase().collection(collectionName),
    userLevelCode = LevelCode.managementIndex.toString(),
    verify = verifyMiddleware(userLevelCode);

  router.get('/api/users', SessionMiddleware, LogMiddleware, verify, (request: RequestHaveLogger, response) => {

    // 不会显示超级管理员的信息
    collection.find({
      level: {
        $ne: 0
      }
    })
      .toArray()
      .then(result => {
        responseAndTypeAuth(response, {
          stateCode: 200,
          data: result,
          message: ''
        });
      })
      .catch(error => {

        code500(response);
        logger500(request.logger, undefined, undefined, error);

      });

  });

  /**
   * 定义请求格式验证模板
   */
  const postShape = apiCheck.shape({
    account: apiCheck.string,
    nickname: apiCheck.string.optional,
    level: apiCheck.range(1, 63).optional,
    password: apiCheck.string.optional,
    controlarea: apiCheck.arrayOf(apiCheck.string).optional
  }).strict;

  const postCheckMiddleware: Middleware = (request, response, next) => {

    const body: PostShape = request.body;

    const checkedResult = postShape(body);
    
    if(checkedResult instanceof Error){
      logger400(request.logger,body,undefined,checkedResult);
      return code400(response);
    }else if(body.password && body.password.length !== 40){
      logger400(request.logger, body, SystemErrorCode['错误:密钥验证错误']);
      return code400(response);
    }else if(body.account && body.account === globalDataInstance.getSuperUserAccount()){
      logger400(request.logger,body,SystemErrorCode['错误:尝试修改超级管理员'],undefined);
      return code400(response);
    }

    return next();

  }

  router.post('/api/users',
    JSONParser,
    SessionMiddleware,
    LogMiddleware,
    verify,
    postCheckMiddleware,
    (request: RequestHaveLogger, response) => {

      // TODO 传入密码进行加密

    });

  router.delete('/api/users', SessionMiddleware, LogMiddleware, verify, (request, response) => {

  });

  return router;

}


