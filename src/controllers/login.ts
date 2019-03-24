import { AddRoute, RequestHaveLogger } from "../types";
import { Router } from "express";
import * as apiCheck from "api-check";
import { logger400, code400, logger500, responseAndTypeAuth, code500,JSONParser } from "./public";
import { responseMessage, SystemErrorCode } from "../code";


/**
 * 简介:
 * 该模块服务器管理员登陆
 * 顶级URL为/login
 * 本模块导出的是模块化路由
 * 该路由下有多个路径
 */

/**
 * 本模块使用的集合名称
 */
export const CollectionName = 'model_users';

/**
 * 该接口描述了POST请求用户传递内容数据的类型
 */
interface PostForceShape {
  /**
   * 帐户名称
   */
  account: string;
  /**
   * 帐户密码
   */
  password: string;
}

/**
 * login
 */
const postLoginShape = apiCheck.shape({
  account: apiCheck.string,
  password: apiCheck.string
}).strict;

export const addRoute: AddRoute = ({ LogMiddleware, SessionMiddleware, verifyMiddleware }, globalDataInstance) => {

  const
    router = Router(),
    collection = globalDataInstance.getMongoDatabase().collection(CollectionName);

  router.post('/login', JSONParser, SessionMiddleware, LogMiddleware,
    (request: RequestHaveLogger, response, next) => {
      // 拦截已经登陆的用户
      if (
        request.session.userid ||
        request.session.level ||
        request.session.levelCodeRaw) {
        return code500(response);
      }
      next();
    },
    (request: RequestHaveLogger, response) => {

      const
        requestBody: PostForceShape = request.body,
        checkResult = postLoginShape(requestBody);

      if (checkResult instanceof Error) {
        logger400(request.logger, requestBody, undefined, checkResult);
        return code400(response);
      }

      collection.findOne({
        account: requestBody.account
      }).then((result) => {

        if (!result) {
          return code400(response, responseMessage['错误:用户不存在']);
        }

        if (result.password !== requestBody.password) {
          return code400(response, responseMessage['错误:帐号或者密码错误']);
        }

        const session = request.session;
        session.userid = result.account;
        session.level = result.level;
        session.levelCodeRaw = result.levelcoderaw;

        return responseAndTypeAuth(response, {
          stateCode: 200,
          message: responseMessage['登陆成功'],
          data: {
            nickName: result.nickName,
            level: result.level,
            levelCodeRaw: result.levelcoderaw,
            controlArea: result.controlarea
          }
        });

      }).catch((error) => {
        logger500(request.logger, requestBody, SystemErrorCode['错误:数据库读取错误'], error);
        code400(response);
      });


    });

  return router;

}