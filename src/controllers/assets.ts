import { Express, Router } from "express";
import { logger400, logger500, code400, code500, responseAndTypeAuth, autoReadOne, JSONParser, code200,deepUpdate } from "./public";
import { RequestHaveLogger, AddRoute } from "../types";
import { getRemoveIdProjection } from "../model/utils";
import { SystemErrorCode } from "../code";
import { updateOfNoticeModelInAssets } from "../model/collectionUpdate";
import * as Model from "./model";

/**
 * 简介:
 * 该模块负责静态资源的管理
 * 包含了
 * - 专业消息管理
 * - 静态图片管理
 * - 应用程序名称
 * - 全局公告
 * 顶级URL为/assets
 * 本模块导出的是模块化路由.
 * 该模块下有多个路径
 */

const
  padding = (pad: any) => (target, data) => Object.assign(target, pad, data);


const combine = (specialityModel: Array<any>, notice: Array<any>) => {

}

/**
 * 本模块使用的集合名称
 */
export const CollectionName = 'model_assets';


export const addRoute: AddRoute = ({ LogMiddleware, SessionMiddleware, verifyMiddleware }, globalDataInstance) => {

  const
    router = Router(),
    collection = globalDataInstance.getMongoDatabase().collection(CollectionName);

  // 获取
  router.get('/assets/speciality', LogMiddleware, SessionMiddleware, (request: RequestHaveLogger, response, next) => {

    autoReadOne(collection, response, request.logger).then(({ speciality }) => {
      responseAndTypeAuth(response, {
        stateCode: 200,
        message: speciality
      });
    });

  });

  // 获取其他其他资源
  router.get('/assets/:type/:key', LogMiddleware, SessionMiddleware, (request: RequestHaveLogger, response, next) => {

    const { type, key } = request.params;

    autoReadOne(collection, response, request.logger).then(result => {

      try {
        responseAndTypeAuth(response, {
          stateCode: 200,
          message: result[type][key]
        });
      } catch (error) {
        code500(response);
        logger500(request.logger, request.params, SystemErrorCode['错误:匹配数据库数据失败'])
      }

    });

  });

  // 修改通知模型
  router.post('/assets/speciality', SessionMiddleware, LogMiddleware, JSONParser, (request: RequestHaveLogger, response) => {

    const
      OriginalNoticeModel = request.body,
      specialityCollection = globalDataInstance.getMongoDatabase().collection(Model.CollectionName);

    updateOfNoticeModelInAssets(collection, specialityCollection, OriginalNoticeModel).then((updateResult) => {
      if (updateResult.result.ok) {
        code200(response);
      }
    })
      .catch((error) => {
        debugger;
        logger500(request.logger, OriginalNoticeModel, SystemErrorCode['错误:数据库回调异常'], error);
        code500(response);
      });

  });

  // 修改其他资源
  router.post('/assets/:type/:key', SessionMiddleware, LogMiddleware, JSONParser, (request: RequestHaveLogger, response, next) => {

    const 
      { type,key } = request.params,
      { operation,data } = request.body;
    

    autoReadOne(collection, response, request.logger).then(result => {

      try {

        return collection.updateOne({}, deepUpdate(operation, result, data, type, key),{
          upsert:true
        });

      } catch (error) {
        code500(response);
        logger500(request.logger, request.params, SystemErrorCode['错误:匹配数据库数据失败']);
      }

    }).then((updateResult)=>{
    

      if(updateResult.result.ok){
        // TODO testing and editing
      }

    })
    .catch((error)=>{
      code500(response);
      logger500(request.logger, request.params, SystemErrorCode['错误:数据库写入失败'],error);
    });


  });


  return router;
}