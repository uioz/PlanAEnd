import { Router } from "express";
import { AddRoute, RequestHaveLogger } from "../types";
import { code200, code500, logger500 } from "./public";
import { responseMessage, SystemErrorCode } from "../code";

/**
 * 简介:
 * 该模块用于管理员登出
 * 顶级URL为/logout
 * 本模块导出的是模块化路由
 * 该路由下只允许GET请求
 */

/**
 * 本模块使用的集合名称
 */
export const CollectionName = 'model_users';

/**
 * GET对应的权限下标(不需要权限)
 */
export const LevelIndexOfGet = '';

export const addRoute: AddRoute = ({ LogMiddleware, SessionMiddleware, verifyMiddleware }) => {

  const
    router = Router();

  router.get('/logout', SessionMiddleware, verifyMiddleware(LevelIndexOfGet), LogMiddleware, (request: RequestHaveLogger, response, next) => {

    request.session.destroy((error) => {
      if (error) {
        logger500(request.logger, undefined, SystemErrorCode['错误:session移出失败']);
        code500(response);
      } else {
        code200(response, responseMessage['登出成功']);
      }
    });

  });

  return router;

}