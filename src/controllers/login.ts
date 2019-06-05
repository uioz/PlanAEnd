import { AddRoute, RequestHaveLogger } from "../types";
import { Router } from "express";
import * as apiCheck from "api-check";
import { logger400, code400, logger500, responseAndTypeAuth, code500 } from "./public";
import { responseMessage, SystemErrorCode } from "../code";
import { JSONParser } from "../middleware/jsonparser";
import { setInfoToSession } from "../helper/session";


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

export const addRoute: AddRoute = ({ LogMiddleware, SessionMiddleware }, globalDataInstance) => {

  const
    router = Router(),
    Database = globalDataInstance.getMongoDatabase(),
    collection = Database.collection(CollectionName);

  router.post('/login', JSONParser, SessionMiddleware, LogMiddleware,
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

        // 基本内容检查
        if (!result) {
          return code400(response, responseMessage['错误:用户不存在']);
        }

        if (result.password !== requestBody.password) {
          return code400(response, responseMessage['错误:帐号或者密码错误']);
        }

        // session 写入
        if (result.level !== 0) {
          setInfoToSession(request, { userid: result._id+'' });
        } else {
          setInfoToSession(request, {
            userid: result._id+'',
            superUser: true
          });
        }

        // 写入最后登录时间
        collection.updateOne({
          account: result.account
        }, {
            $set: {
              lastlogintime: Date.now()
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