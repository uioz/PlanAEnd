import * as bodyParser from "body-parser";

/**
 * 使用body-paser定义JSON解析中间件
 */
export const JSONParser = bodyParser.json({
  inflate: true, // 自动解压
  limit: '100kb', // JSON大小上限
  strict: true,// 只允许合法JSON通过
  type: 'application/json', //MIME类型
});
