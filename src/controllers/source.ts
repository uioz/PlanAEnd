import { LevelCode, ResponseErrorCode, responseMessage, SystemErrorCode } from "../code";
import { Middleware, ErrorMiddleware, restrictResponse, RequestHaveLogger, ParsedSession } from "../types";
import * as multer from "multer";
import { checkSourceData, ParseOptions, getDefaultSheets, WriteOptions, transformLevelToArray, getLevelIndexs, correctSpeciality } from "planaend-source";
import { Logger } from "log4js";
import { read as XlsxRead, utils as XlsxUtils, write as XlsxWrite } from "xlsx";
import { writeOfSource } from "../model/collectionWrite";
import { globalDataInstance } from "../globalData";
import { InsertWriteOpResult } from "mongodb";
import { code500, logger500, responseAndTypeAuth, code400 } from "./public";
import { GetUserI } from "../helper/user";


/**
 * 说明:
 * /source/:year
 * 管理源数据的上传和下载
 */


/**
* 用于检测url中的参数数值是否在合理范围区间内
* @param number 整形数值
*/
export const checkNumber = number => number !== NaN && number >= 0 && number < Number.MAX_SAFE_INTEGER;

/**
 * 源数据上传配置
 */
const Multer = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldNameSize: 15, // 字段名字的长度
    fieldSize: 131072, // 字段最大大小 1Mib
    files: 1, // 文件最大数量
    fileSize: 1310720, // 单个文件大小10Mib
    parts: 1966080, // fields + files的最大大小 15Mib
  }
});

/**
 * 本模块对应的URL地址
 */
export const URL = '/source/:year';
/**
 * GET下对应的权限下标
 */
export const LevelIndexOfGet = LevelCode.DownloadIndex.toString();
/**
 * POST下对应的权限下标
 */
export const LevelIndexOfPost = LevelCode.UploadIndex.toString();

/**
 * 数据库名称前缀
 */
export const DatabasePrefixName = 'source_';

/**
 * 利用 request.session 中提供的数据获取对应的query对象
 * @param request request
 */
export const correctQuery = async (request: RequestHaveLogger) => {

  const
    { userid, superUser } = request.session;

  if (superUser) {
    return {};
  }

  const result = await GetUserI().getInfo(userid);

  if (result.controlarea.length === 0) {
    return {};
  } else {
    return { speciality: { $in: result.controlarea } }
  }

}

/**
 * GET下的处理中间件
 */
export const MiddlewaresOfGet: Array<Middleware> = [(request: RequestHaveLogger, response) => {

  // 此时通过的请求都是经过session验证的请求
  // 此时挂载了logger 和 express-session 中间件

  (async function () {

    const
      year: string = request.params.year,
      databaseFullName = DatabasePrefixName + year,
      collection = globalDataInstance.getMongoDatabase().collection(databaseFullName),
      query = await correctQuery(request),
      resultArray = [];

    collection.find(query, {
      projection: {
        _id: false
      }
    }).forEach(itemObj => resultArray.push(itemObj), () => {
      if (resultArray.length) {

        try {

          const workBook = XlsxUtils.book_new();

          XlsxUtils.book_append_sheet(workBook, XlsxUtils.json_to_sheet(resultArray), 'Sheet1');

          const file = XlsxWrite(workBook, Object.assign(WriteOptions, { type: 'buffer' }))
          response.set('Content-Type', 'application/octet-stream');
          response.set('Content-Disposition', 'attachment;filename=' + encodeURI(`${year}.xlsx`));
          response.send(file).end();

        } catch (error) {
          code500(response);
          logger500(request.logger, request.params, SystemErrorCode['错误:数据转换失败'], error);
          return code500(response);
        }

      } else {
        return responseAndTypeAuth(response, {
          message: responseMessage['错误:找不到文件'],
          stateCode: 404
        });
      }
    });

  })();


}];

/**
 * POST下对应的处理中间件
 */
export const MiddlewaresOfPost: Array<Middleware | ErrorMiddleware> = [Multer.single('data'), (error, request, response, next) => {

  // 如果是multer的错误则记录错误
  if ((error as any) instanceof (multer as any).MulterError) {
    ((request as any).logger as Logger).error((error as any).stack);
  }
  // 这里需要视为错误请求,即使用户是通过验证的情况下
  // 将所有的上传失败视为一种错误
  return next(ResponseErrorCode['错误:表单上传错误']);

}, (request: RequestHaveLogger, response) => {

  (async function () {

    const year = parseInt(request.params.year);

    if (!year || year !== year) {
      return code400(response);
    }

    const
      workBook = XlsxRead(request.file.buffer, Object.assign(ParseOptions, {
        type: 'buffer'
      })),
      workSheet = getDefaultSheets(workBook),
      { userid, superUser } = request.session;

    if (workSheet && checkSourceData(workSheet)) {

      // 数组化工作表
      const arrayizeWorkSheet = transformLevelToArray(XlsxUtils.sheet_to_json(workSheet), getLevelIndexs(workSheet));

      let jsonizeSourceData;

      if(superUser){

        jsonizeSourceData = arrayizeWorkSheet;

      }else{

        const result = await GetUserI().getInfo(userid);

        if(result.controlarea.length === 0){

          jsonizeSourceData = arrayizeWorkSheet;

        }else{

          jsonizeSourceData = correctSpeciality(arrayizeWorkSheet,result.controlarea);

        }

      }
      
      // 利用控制区域字段来过滤上传的内容
      // const jsonizeSourceData = isAdmin || controlAll ? arrayizeWorkSheet : correctSpeciality(arrayizeWorkSheet, request.session.controlarea);

      writeOfSource(globalDataInstance.getMongoDatabase().collection(DatabasePrefixName + year), jsonizeSourceData).then((results: Array<InsertWriteOpResult>) => {

        for (const insertResult of results) {
          if (insertResult.result.ok === 1) {

            responseAndTypeAuth(response, {
              stateCode: 200,
              data: {
                total: arrayizeWorkSheet.length,
                real: jsonizeSourceData.length
              },
              message: responseMessage['数据上传成功']
            });

            request.logger.error(`${SystemErrorCode['错误:数据库写入失败']} DIR:${__dirname} CollectionName:${DatabasePrefixName + year} userID:${request.session.userid}`);
          } else {
            logger500(request.logger, workSheet, SystemErrorCode['错误:数据库回调异常']);
            code500(response, responseMessage['错误:表单上传错误']);
          }
        }

      }).catch((error) => {
        logger500(request.logger, workSheet, SystemErrorCode['错误:数据库写入失败'], error);
        code500(response, responseMessage['错误:服务器错误']);
      });

    }

    return code400(response);

  })();

}];
