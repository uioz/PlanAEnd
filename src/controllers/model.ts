import { LevelCode, responseMessage, SystemErrorCode } from "../code";
import { Middleware, ErrorMiddleware, RequestHaveLogger } from "../types";
import { globalDataInstance } from "../globalData";
import { updateOfNoticeModelInModel } from "../model/collectionUpdate";
import { writeOfModel } from "../model/collectionWrite";
import { responseAndTypeAuth, code500, logger500, code200, autoReadOne, logger400, code400 } from "./public";
import { JSONParser } from "../middleware/jsonparser";
import { CollectionName as AssetsCollectionName } from "./assets";
import { GetUserI } from "../helper/user";
import { readUserList } from "../model/collectionRead";

/**
 * 简介:
 * 本模块用于管理专业模型的获取和修改
 * /model
 */

/**
 * 本模块对应的URL地址
 */
export const URL = '/model';
/**
 * GET 对应的权限下标(不需要权限,但是需要登录)
 */
export const LevelIndexOfGet = '';

/**
 * POST 对应的权限下标
 */
export const LevelIndexOfPost = LevelCode.EditIndex.toString();
/**
 * 数据库名称
 */
export const CollectionName = 'model_speciality';

/**
 * GET 对应的中间件
 */
export const MiddlewaresOfGet: Array<Middleware> = [
  (request, response) => {

    const collection = globalDataInstance.getMongoDatabase().collection(CollectionName);

    (async function (collection) {

      const
        findResult = await autoReadOne(collection, response, request.logger);

      let completeResult = {};

      // 如果有专业结构, 而且这名用户被限制了控制范围
      // 返回控制范围和专业结构的交集
      if (request.session.superUser) {
        completeResult = findResult;
      } else {

        const { controlarea } = await GetUserI().getInfo(request.session.userid);
        // 如果控制区域为 0 则表示可以获取所有区域的结构
        if (controlarea.length > 0) {
          for (const key of controlarea) {
            completeResult[key] = findResult[key];
          }
        } else {
          completeResult = findResult;
        }

      }

      return responseAndTypeAuth(response, {
        message: '',
        stateCode: 200,
        data: completeResult
      });

    })(collection).catch(error => {
      logger500(request.logger, undefined, undefined, error);
      return code500(response);
    });


  }
]

// const patternOfData = new RegExp(`^[\u2E80-\u2EFF\u2F00-\u2FDF\u3000-\u303F\u31C0-\u31EF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FBF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\\w]{1,10}$`);
const patternOfData = new RegExp(/^\S{1,20}$/);

/**
 * 递归数据检测上传的专业模型是否符合规范
 * **注意**:一旦检测到错误会抛出异常
 * @param data 要被检测的数据
 */
const checkBody = (data: any) => {
  if (Array.isArray(data)) {
    // 检查数组中是否有重名的
    if (new Set(data).size === data.length) {
      for (const item of data) {
        // 检测所有的值是否通过了验证
        if (!patternOfData.test(item)) {
          throw new Error(`The ${item} of element of Array unable to pass verify.`);
        }
      }
      return;
    } else {
      throw new Error("The element of array can't be repeat.")
    }

  }

  for (const key of Object.keys(data)) {
    // 键名要通过测试
    if (patternOfData.test(key)) {
      if (typeof data[key] === 'object') {
        checkBody(data[key]);
      } else {
        // 只能是Array和Object
        throw new Error(`The Object-value ${data[key]} type is not object or array`);
      }

    } else {
      throw new Error(`The Object-key ${key} unable to pass verify.`);
    }
  }
}

/**
 * POST 对应的中间件
 */
export const MiddlewaresOfPost: Array<Middleware | ErrorMiddleware> = [
  JSONParser,
  (request: RequestHaveLogger, response) => {

    try {

      const
        SourceData = request.body,
        Database = globalDataInstance.getMongoDatabase();

      checkBody(SourceData);

      // 同步到通知模型上, 同步成功专业模型储存
      updateOfNoticeModelInModel(Database.collection(AssetsCollectionName), SourceData).then(({ result }) => {

        if (result.ok) {
          return writeOfModel(Database.collection(CollectionName), SourceData);
        }

        logger500(request.logger, SourceData, SystemErrorCode['错误:数据库回调异常']);
        code500(response);

      }).then((writeResult) => {

        if (writeResult.ok) {
          code200(response);
        } else {
          logger500(request.logger, SourceData, SystemErrorCode['错误:数据库回调异常']);
          code500(response);
        }

      })
        .catch((error) => {
          logger500(request.logger, SourceData, SystemErrorCode['错误:数据库回调异常'], error);
          code500(response);
        });

    } catch (error) {
      logger400(request.logger, request.body, undefined, error);
      return code400(response);
    }

  }
]
