import { AddRoute, RequestHaveLogger, Middleware } from "../types";
import { Router } from "express";
import { LevelCode, Privilege } from "../utils/privilege";
import { responseAndTypeAuth, code500, logger500, logger400, code400, code200 } from "./public"
import { JSONParser } from "../middleware/jsonparser";
import * as apiCheck from "api-check";
import { SystemErrorCode, responseMessage } from "../code";
import { globalDataInstance } from "../globalData";
import * as sha1 from "sha1";
import { setInfoToSession } from "../helper/session";
import { GetUserI, setUser } from "../helper/user";

/**
 * 该接口描述了POST请求用户传递内容数据的类型
 */
interface PostShape {
  /**
   * 用户id
   */
  userid: string;
  /**
   * 账户名称
   */
  account?: string;
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
    }, {
        projection: {
          password: false,
          lastlogintime: false
        },
      })
      .toArray()
      .then(result => {

        const formated = result.map(({ _id, ...rest})=>{
          return {
            userid:_id,
            ...rest
          }
        });

        responseAndTypeAuth(response, {
          stateCode: 200,
          data: formated,
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
    userid: apiCheck.string.optional,
    account: apiCheck.string.optional,
    nickname: apiCheck.string.optional,
    level: apiCheck.range(1, 63).optional,
    password: apiCheck.string.optional,
    controlarea: apiCheck.arrayOf(apiCheck.string).optional
  }).strict;

  const postCheckMiddleware: Middleware = (request, response, next) => {

    const body: PostShape = request.body;

    const checkedResult = postShape(body);

    if (checkedResult instanceof Error) {
      logger400(request.logger, body, undefined, checkedResult);
      return code400(response);
    } else if (body.password && body.password.length !== 40) {
      logger400(request.logger, body, SystemErrorCode['错误:密钥验证错误']);
      return code400(response);
    } else if (request.session.superUser) {
      logger400(request.logger, body, SystemErrorCode['错误:尝试修改超级管理员'], undefined);
      return code400(response);
    }

    return next();

  }

  const postFormatMiddleware: Middleware = (request, response, next) => {

    // 二次混淆密码
    if (request.body.password) {
      request.body.password = sha1(request.body.password);
    }

    // 将权限值转为对应的字符串形式
    if (request.body.level) {
      request.body.levelcoderaw = Privilege.rawCodeIfy(request.body.level)
    }

    return next();

  }

  router.post('/api/users',
    JSONParser,
    SessionMiddleware,
    LogMiddleware,
    verify,
    postCheckMiddleware,
    postFormatMiddleware,
    (request: RequestHaveLogger, response) => {


      setUser(collection, request.body as PostShape)
        .then(() => code200(response))
        .catch((error) => {
          logger500(request.logger, request.body, undefined, error);
          return code500(response);
        })


    });


  const deleteShape = apiCheck.shape({
    userid: apiCheck.string
  }).strict

  const deleteCheckMiddleware: Middleware = (request, response, next) => {

    const checkedResult = deleteShape(request.params);

    if (checkedResult instanceof Error) {
      logger400(request.logger, request.body, undefined, checkedResult);
      return code400(response);
    }

    const { userid } = request.params;

    if (userid === globalData.getSuperUserId()) {
      logger400(request.logger, request.params, SystemErrorCode['错误:尝试修改超级管理员'], undefined);
      return code400(response);
    }

    return next();

  }

  router.delete('/api/users/:userid',
    SessionMiddleware,
    LogMiddleware,
    verify,
    deleteCheckMiddleware,
    (request: RequestHaveLogger, response, next) => {

      const { userid } = request.params;

      collection.deleteMany({
        _id: userid
      }).then(deleteResult => {

        if (deleteResult.deletedCount > 0) {
          next();
        }

        return responseAndTypeAuth(response, {
          stateCode: 200,
          message: responseMessage['错误:暂无数据'],
        });

      }).catch(error => {

        logger500(request.logger, request.params, SystemErrorCode['错误:数据库回调异常'], error);
        return code500(response);

      });

    }, (request: RequestHaveLogger, response) => {

      const { userid } = request.params;

      if (userid === request.session.userid) {
        request.session.destroy((/** noop */) => { });
      }

      code200(response, responseMessage['删除成功']);

    });

  return router;

}


