import { Router } from "express";
import { AddRoute, Middleware, RequestHaveLogger, restrictResponse } from "../types";
import * as apiCheck from "api-check";
import { logger400, code400, code200, responseAndTypeAuth, logger500, code500 } from "./public";
import { responseMessage, SystemErrorCode } from "../code";
import { clientOpenFetchMiddleware, clientAccessControlMiddleware, ReuqestHaveClientAccess } from "../middleware/clientaccess";
import * as Dotprop from "dot-prop";

export const addRoute: AddRoute = ({ LogMiddleware }, globalDataInstance) => {


  const router = Router();

  const
    modelName = 'model_speciality',
    studentName = `source_${new Date().getFullYear()}`,
    modelCollection = globalDataInstance.getMongoDatabase().collection(modelName),
    studentCollection = globalDataInstance.getMongoDatabase().collection(studentName);


  const QueryShape = apiCheck.shape({
    number: apiCheck.string,
    name: apiCheck.string,
  }).strict;

  interface QueryShape {
    name: string;
    number: string;
    picked: string;
  }

  const shapeCheckMiddleware: Middleware = (request, response, next) => {

    const checkedResult = QueryShape(request.query);

    if (checkedResult instanceof Error) {
      logger400(request.logger, request.query, undefined, checkedResult);
      code400(response);
      return;
    }

    return next();

  }

  interface StudentIsExist extends RequestHaveLogger {
    studentInfo: {
      speciality: string;
      specialityPath: Array<string>;
      /**
       * 表示用户已经选择的专业名称
       */
      picked: string;
      /**
       * 用户学号
       */
      number: string;
    }
  }

  const studentIsExistMiddleware: Middleware = (request: StudentIsExist, response, next) => {

    (async function (request, query, studenCollection) {

      /**
       * structure of query
       * {
       *  name:string,
       *  number:sting
       * }
       */

      const { name, number } = request.query;

      const result = await studenCollection.findOne({name,number}, {
        projection: {
          _id: false
        }
      });

      if (result) {
        request.studentInfo = result;
        return next();
      }

      code200(response, responseMessage['错误:用户不存在']);

    })(request, request.query, studentCollection);

  }

  router.get('/api/student/info',
    LogMiddleware,
    shapeCheckMiddleware,
    clientOpenFetchMiddleware, // 获取开放数据 挂载到 request.clientAccess 上
    clientAccessControlMiddleware, // 客户端访问控制中间件 利用 request.clientAccess 属性
    studentIsExistMiddleware, // 学生是否存在中间件挂载到 request.studentInfo 上
    (request: ReuqestHaveClientAccess & StudentIsExist, response) => {

      (async (modelCollection) => {

        // 获取该学生对应大类的数据
        const specialityModel = (await modelCollection.findOne({}))[request.studentInfo.speciality];

        responseAndTypeAuth(response, {
          stateCode: 200,
          message: '',
          data: Dotprop.get(specialityModel, request.studentInfo.specialityPath.join('.'),specialityModel)
        });

      })(modelCollection)
        .catch(error => {
          logger500(request.logger, request.query, SystemErrorCode['错误:匹配数据库数据失败'], error);
          code500(response);
        });

    });

  /**
   * 获取用户填写的结果, 如果填写的内容则返回如下结构
   * {
   *  speciality:string; // 专业类型
   *  specialityPath:Array<string>; // 专业路径
   *  picked:string; // 最终用户选择的专业
   * }
   * 如果没有填写的内容则返回 false
   */
  router.get('/api/student/result',
    LogMiddleware,
    shapeCheckMiddleware,
    clientOpenFetchMiddleware,
    clientAccessControlMiddleware,
    studentIsExistMiddleware,
    (request: ReuqestHaveClientAccess & StudentIsExist, response) => {

      // by default that mean not found anything.
      const responseData: restrictResponse = {
        stateCode: 200,
        message: '',
        data: false
      };

      if (request.studentInfo.picked) {

        const { specialityPath, picked, speciality } = request.studentInfo;

        responseData.data = {
          speciality,
          specialityPath,
          picked
        }

      }

      responseAndTypeAuth(response, responseData);

    });

  const QueryShapeForPost = apiCheck.shape({
    number: apiCheck.string,
    name: apiCheck.string,
    picked: apiCheck.string.optional // only work on post
  });

  const postShapeCheckMiddleware: Middleware = (request, response, next) => {

    const checkedResult = QueryShapeForPost(request.query);

    if (checkedResult instanceof Error) {

      logger400(request.logger, request.query, undefined, checkedResult);
      code400(response);
      return;

    }

    return next();

  }

  /**
   * 修改用户所上传的内容
   */
  router.post('/api/student/result',
    LogMiddleware,
    postShapeCheckMiddleware,
    clientOpenFetchMiddleware,
    clientAccessControlMiddleware,
    studentIsExistMiddleware,
    (request: ReuqestHaveClientAccess & StudentIsExist, response) => {

      const { number, picked } = request.query as QueryShape;

      studentCollection.updateOne({
        number
      }, {
          $set: {
            picked
          }
        })
        .then(updateResult => {

          responseAndTypeAuth(response, {
            stateCode: 200,
            message: '',
            data: updateResult.result.nModified // 如果修改数为 0 返回false 反之返回 true
          });

        })
        .catch(error => {
          code500(response);
          logger500(request.logger, request.query, SystemErrorCode['错误:数据库回调异常'], error);
        });

    });

  return router;

}