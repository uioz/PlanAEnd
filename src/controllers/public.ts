import { Response } from "express";
import { restrictResponse, Middleware, ErrorMiddleware } from "../types";
import * as bodyParser from "body-parser";
import { responseMessage, SystemErrorCode } from "../code";
import { Logger } from "log4js";
import { SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG } from "constants";

/**
 * 含有类型验证的JSON响应
 * **PS**:主要是懒得修改定义了
 * @param response express响应对象
 * @param responseData 响应的JSON数据
 */
export const responseAndTypeAuth = (response: Response, responseData: restrictResponse) => response.json(responseData);

/**
 * 定义了响应码的基本体
 */
const ResponseBodyCollection = {
  200: {
    stateCode: 200,
    message: responseMessage['数据上传成功']
  },
  400: {
    stateCode: 400,
    message: responseMessage['错误:数据校验错误']
  },
  500: {
    stateCode: 500,
    message: responseMessage['错误:服务器错误']
  }
}

/**
 * 含有响应码体的生成器
 * @param code 状态码
 */
const GeneratorCodeResponse = (code: number) => {
  return (response: Response, message?: responseMessage) => {
    if (message) {
      return responseAndTypeAuth(response, Object.assign({}, ResponseBodyCollection[code], { message }));
    } else {
      return responseAndTypeAuth(response, ResponseBodyCollection[code]);
    }
  }
}

/**
 * 使用body-paser定义JSON解析中间件
 */
export const JSONParser = bodyParser.json({
  inflate: true, // 自动解压
  limit: '100kb', // JSON大小上限
  strict: true,// 只允许合法JSON通过
  type: 'application/json', //MIME类型
});

/**
 * 响应500状态码
 * @param response express响应对象
 * @param message 响应的文本内容 默认为服务器错误
 */
export const code500 = GeneratorCodeResponse(500);

/**
 * 响应400状态码
 * @param response express响应对象
 * @param message 响应的消息 默认为数据校验错误
 */
export const code400 = GeneratorCodeResponse(400);

/**
 * 响应200状态码
 * @param response express响应对象
 * @param message 响应的消息 默认为数据上传成功
 */
export const code200 = GeneratorCodeResponse(200);

/**
 * 记录400错误
 * @param logger log4js-logger实例
 * @param data 用户请求的数据
 * @param message 系统内部使用的错误码
 * @param error 错误对象或者含有错误信息的对象
 */
export const logger400 = (logger: Logger, data: object, message: SystemErrorCode = SystemErrorCode['警告:数据校验错误'], error?: Error) => {
  logger.warn(`${message} Original data from user ${JSON.stringify(data)}`);
  if (error) {
    logger.warn(error);
  }
}

/**
 * 记录500错误
 * @param logger log4js-logger实例
 * @param data 用户请求的数据
 * @param message 系统内部使用的错误码
 * @param error 错误对象或者含有错误信息的对象
 */
export const logger500 = (logger: Logger, data?: object, message: SystemErrorCode = SystemErrorCode['错误:数据库读取错误'], error?: Error | object) => {
  if (message) {
    logger.error(`${message} Original data from user ${JSON.stringify(data)}`);
  }
  if (error) {
    logger.error(error);
  }
}

/**
 * 集合了两种中间件的类型
 */
type Middlewares = Middleware | ErrorMiddleware;

/**
 * 这个类型描述了ControllerGenerator类内部保存的参数的类型
 * - methods
 * - url
 * - Middleware
 */
type Tuple = [string, string, Middlewares];

/**
 * 该类型描述了ControllGenerator类的四个方法的名称
 */
type beforeMiddlewareType = 'get' | 'post' | 'delete' | 'put';

/**
 * 用于快速生成ControllerGenerator类的四个方法
 * @param methodType 方法类型
 */
const CraeteMethodsForControllerGenerator = (methodType: beforeMiddlewareType) => function (this: ControllerGenerator, url: string | Middlewares, middleware?: Middlewares) {

  if (typeof url === 'string') {
    if (middleware) {

      this
        .setThisTimeMethodName(methodType)
        .setThisTimeUrl(url)
        .sets.push([methodType, url, middleware]);

    } else {
      throw new Error("must specifically give middleware in arguments at second position if first params type is string");
    }
  } else {
    this
      .setThisTimeMethodName(methodType)
      .setThisTimeUrl(this.GlobalUrl)
      .sets.push([methodType, this.GlobalUrl, url]);
  }

  return this;
}

/**
 * 控制器生成类
 */
class ControllerGenerator implements Iterable<Tuple> {

  public sets: Array<Tuple>;
  public lastCallMethodName: beforeMiddlewareType;
  public lastCallMethodUrl: string;
  public beforeMiddlewares: {
    [key in beforeMiddlewareType]: Array<{
      url: string,
      MiddlewaresNames: Array<string>
    }>
  } = {
      get: [],
      post: [],
      delete: [],
      put: []
    };

  /**
   * 创建一个控制器实例,这个实例实现了了迭代接口
   * 
   * 该构造函数允许你指定一个默认的URL地址,
   * 在后续调用方法的时候省略URL参数可以使用构造时候传入的地址,
   * 当作默认URL
   * @param GlobalUrl 默认URL
   */
  constructor(public GlobalUrl: string) { }

  public before(...rest: Array<string>) {

    if (!this.lastCallMethodName) {
      throw new Error("after invoke other methods then you can invoke the before method");
    }

    this.beforeMiddlewares[this.lastCallMethodName].push({
      url: this.lastCallMethodUrl,
      MiddlewaresNames: rest
    });

    return this;

  }

  /**
   * 内部方法
   * 设置本次调用的方法名称
   * 只能被get post delete put方法调用
   * @param name 方法名称
   */
  public setThisTimeMethodName(name: beforeMiddlewareType) {
    this.lastCallMethodName = name;
    return this;
  }

  /**
   * 内部方法
   * 设置本次调用的URL地址
   * 只能被get post delete put方法调用
   * @param url 挂载的url
   */
  public setThisTimeUrl(url: string) {
    this.lastCallMethodUrl = url;
    return this;
  }

  /**
   * 向指定的URL地址挂载中间件,这些挂载的中间件是为get请求准备的
   * 
   * 可以只传入中间件,这个时候URL使用构造函数中传入的内容作为URL
   * @param url URL地址
   * @param middleware URL对应的中间件
   */
  public get = CraeteMethodsForControllerGenerator('get');

  /**
  * 向指定的URL地址挂载中间件,这些挂载的中间件是为get请求准备的
  *
  * 可以只传入中间件,这个时候URL使用构造函数中传入的内容作为URL
  * @param url URL地址
  * @param middleware URL对应的中间件
  */
  public post = CraeteMethodsForControllerGenerator('post');

  /**
  * 向指定的URL地址挂载中间件,这些挂载的中间件是为get请求准备的
  *
  * 可以只传入中间件,这个时候URL使用构造函数中传入的内容作为URL
  * @param url URL地址
  * @param middleware URL对应的中间件
  */
  public delete = CraeteMethodsForControllerGenerator('delete');

  /**
  * 向指定的URL地址挂载中间件,这些挂载的中间件是为get请求准备的
  *
  * 可以只传入中间件,这个时候URL使用构造函数中传入的内容作为URL
  * @param url URL地址
  * @param middleware URL对应的中间件
  */
  public put = CraeteMethodsForControllerGenerator('put');

  public [Symbol.iterator]() {

    let index = 0, len = this.sets.length;
    const i: Iterator<Tuple> = {
      next: () => {
        return (index < len ? { value: this.sets[index++], done: false } : { value: undefined, done: true });
      }
    }

    return i;
  }
}


