import { AddRoute, RequestHaveLogger } from "../types";
import { Router } from "express";
import * as apiCheck from "api-check";
import { logger400, code400, logger500, responseAndTypeAuth, code500 } from "./public";
import { responseMessage, SystemErrorCode } from "../code";
import { JSONParser } from "../middleware/jsonparser";
import { setInfoToSession } from "../helper/session";
import * as sha1 from "sha1";


/**
 * 简介:
 * 该模块用于服务器管理员登陆
 * 顶级URL为/api/login
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

  router.post('/api/login', JSONParser, SessionMiddleware, LogMiddleware,
    (request: RequestHaveLogger, response) => {

      const
        requestBody: PostForceShape = request.body,
        checkedBody = postLoginShape(requestBody);

      if (checkedBody instanceof Error) {
        logger400(request.logger, requestBody, undefined, checkedBody);
        return code400(response);
      }

      requestBody.password = sha1(requestBody.password);

      collection.findOne(requestBody)
        .then((result) => {

          if (!result) {
            return code400(response, responseMessage['错误:帐号或者密码错误']);
          }

          // 重建 session 后写入新的用户id 
          request.session.regenerate((error) => {

            if (error) {
              return logger500(request.logger, requestBody, SystemErrorCode['错误:session移出失败'], error);
            }

            // session 写入
            if (result.level !== 0) {
              setInfoToSession(request, { userid: result._id + '' });
            } else {
              setInfoToSession(request, {
                userid: result._id + '',
                superUser: true
              });
            }

            responseAndTypeAuth(response, {
              stateCode: 200,
              message: responseMessage['登陆成功'],
              data: {
                nickName: result.nickname,
                level: result.level,
                levelCodeRaw: result.levelcoderaw,
                controlArea: result.controlarea
              }
            });

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

          });

        })
        .catch((error) => {
          logger500(request.logger, requestBody, SystemErrorCode['错误:数据库读取错误'], error);
          code400(response);
        });

    });

  return router;

}