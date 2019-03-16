import { ErrorMiddleware, Middleware } from "../types";

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
 * 该类型描述了ControllGenerator类的四个主要方法的名称
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
export class ControllerGenerator implements Iterable<Tuple> {

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
   * 创建一个控制器实例,这个实例实现了了迭代接口.  
   * 可以用来向express上自动注册对应路由的中间件
   * 该构造函数允许你指定一个默认的URL地址,
   * 在后续调用方法的时候省略URL参数可以使用构造时候传入的地址当作默认URL
   * 
   * @param GlobalUrl 默认URL
   */
  constructor(public GlobalUrl: string) { }

  /**
   * 在调用任意一个添加中间件方法后,
   * 调用用该本方法则对该方法以及对应的URL添加前置中间件.
   * @param rest 需要添加的前置中间件的名称
   */
  public before(...rest: Array<string>) {

    if (!this.lastCallMethodName) {
      throw new Error("after invoke other methods then you can invoke the before method");
    }

    const middlewareNames = this.beforeMiddlewares[this.lastCallMethodName].find(elem=>elem.url === this.lastCallMethodUrl);

    middlewareNames.MiddlewaresNames.push(...rest);

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
