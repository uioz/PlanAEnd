import { AddRoute, RequestHaveLogger } from "../types";
import { Router } from "express";
import * as apiCheck from "api-check";
import { logger400, code400, logger500, responseAndTypeAuth, code500 } from "./public";
import { responseMessage, SystemErrorCode } from "../code";
import { JSONParser } from "../middleware/jsonparser";


/**
 * 简介:
 * 该模块用于服务器管理员登陆
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
    Database = globalDataInstance.getMongoDatabase(),
    collection = Database.collection(CollectionName);

  router.post('/login', JSONParser, SessionMiddleware, LogMiddleware,
    (request: RequestHaveLogger, response, next) => {
      // TODO 会存在有session后获取用户信息的情况,所以去掉这个拦截

      // 登录不能使用认证中间件,所以这里
      // 需要手动拦截已经登陆的用户
      if (
        request.session.userId ||
        request.session.level ||
        request.session.levelCodeRaw) {
        return code500(response,responseMessage['错误:重复登录']);
      }
      next();
    },
    (request: RequestHaveLogger, response) => {

      const
        requestBody: PostForceShape = request.body,
        checkedBody = postLoginShape(requestBody);

      if (checkedBody instanceof Error) {
        logger400(request.logger, requestBody, undefined, checkedBody);
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
        session.account = result.account;
        session.userId = result._id;
        session.level = result.level;
        session.levelCodeRaw = result.levelcoderaw;
        session.controlArea = result.controlarea;

        // 写入最后登录时间
        collection.updateOne({
          account: result.account
        }, {
            $set: {
              lastlogintime: new Date
            }
          }).catch((error) => {
            logger500(request.logger, requestBody, SystemErrorCode['错误:数据库回调异常'], error);
          });

        return responseAndTypeAuth(response, {
          stateCode: 200,
          message: responseMessage['登陆成功'],
          data: {
            nickName: result.nickname,
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