import { logger400, logger500, code400, code500,responseAndTypeAuth } from "./public";
import { Middleware } from "../types";
import { globalDataInstance } from "../globalData";
import { getRemoveIdProjection } from "../model/utils";

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

/**
 * 本模块对应的URL地址
 */
export const URL = '/assets/:type/:key';

/**
 * 本模块使用的集合名称
 */
export const CollectionName = 'model_assets';

enum Type {
  'image',
  'appname',
  'globalnotcie',
  'speciality'
}

const getValueFromResult = <T extends object>(data: T, type: string, key: string) => {
  try {
    const result = data[type][key];
    return result !== undefined ? result : false;
  } catch (error) {
    return false;
  }
}

export const MiddlewareOfGet: Array<Middleware> = [
  (request, response, next) => {

    const { type, key } = request.params;

    if (type in Type) {

      const collection = globalDataInstance.getMongoDatabase().collection(CollectionName);

      collection.findOne({}, {
        projection: getRemoveIdProjection()
      })
        .then(result => {

          // speciality字段是唯一一个没有二级键的内容,
          // 所以直接进行返回
          if (type === 'speciality'){
            return responseAndTypeAuth(response,{
              stateCode:200,
              message: result['speciality']
            });
          }

          const finalResult = getValueFromResult(result,type,key);

          if(finalResult === false){
            logger400(request.logger, request.params, undefined, undefined);
            return code400(response);
          }

          return responseAndTypeAuth(response,{
            stateCode:200,
            message:finalResult
          });

        })
        .catch(error => {
          logger500(request.logger, request.params, undefined, error);
          return code500(response);
        });

    } else {
      logger400(request.logger, request.params, undefined, undefined);
      return code400(response);
    }

  }
]
