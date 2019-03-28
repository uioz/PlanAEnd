import { AddRoute, RequestHaveLogger } from "../types";
import { Router } from "express";
import { responseAndTypeAuth, code500, logger500 } from "./public";
import { readOfApiClientBase } from "../model/collectionRead";
import { SystemErrorCode } from "../code";

/**
 * 简介:
 * 管理后台的基本数据获取,获取服务器公告,以及名称和logo等静态内容.
 * 顶级URL为/api/server/base
 * 这个模块对外开放不需要任何添加filter
 */

export const CollectionName = 'model_assets';

export const addRoute: AddRoute = ({ LogMiddleware }, globalDataInstance) => {

  const
    router = Router(),
    collection = globalDataInstance.getMongoDatabase().collection(CollectionName);

  router.get('/api/client/base', LogMiddleware, (request: RequestHaveLogger, response) => {

    readOfApiClientBase(collection).then((result) => {
      responseAndTypeAuth(response, {
        stateCode: 200,
        message: result
      });
    })
      .catch((error) => {
        logger500(request.logger, undefined, SystemErrorCode['错误:数据库回调异常'], error);
        code500(response);
      });

  });

  return router;
}
