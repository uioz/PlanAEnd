"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 用于快速生成ControllerGenerator类的四个方法
 * @param methodType 方法类型
 */
const CraeteMethodsForControllerGenerator = (methodType) => function (url, middleware) {
    if (typeof url === 'string') {
        if (middleware) {
            this
                .setThisTimeMethodName(methodType)
                .setThisTimeUrl(url)
                .sets.push([methodType, url, middleware]);
        }
        else {
            throw new Error("must specifically give middleware in arguments at second position if first params type is string");
        }
    }
    else {
        this
            .setThisTimeMethodName(methodType)
            .setThisTimeUrl(this.GlobalUrl)
            .sets.push([methodType, this.GlobalUrl, url]);
    }
    return this;
};
/**
 * 控制器生成类
 */
class ControllerGenerator {
    /**
     * 创建一个控制器实例,这个实例实现了了迭代接口.
     * 可以用来向express上自动注册对应路由的中间件
     * 该构造函数允许你指定一个默认的URL地址,
     * 在后续调用方法的时候省略URL参数可以使用构造时候传入的地址当作默认URL
     *
     * @param GlobalUrl 默认URL
     */
    constructor(GlobalUrl) {
        this.GlobalUrl = GlobalUrl;
        this.beforeMiddlewares = {
            get: [],
            post: [],
            delete: [],
            put: []
        };
        /**
         * 向指定的URL地址挂载中间件,这些挂载的中间件是为get请求准备的
         *
         * 可以只传入中间件,这个时候URL使用构造函数中传入的内容作为URL
         * @param url URL地址
         * @param middleware URL对应的中间件
         */
        this.get = CraeteMethodsForControllerGenerator('get');
        /**
        * 向指定的URL地址挂载中间件,这些挂载的中间件是为get请求准备的
        *
        * 可以只传入中间件,这个时候URL使用构造函数中传入的内容作为URL
        * @param url URL地址
        * @param middleware URL对应的中间件
        */
        this.post = CraeteMethodsForControllerGenerator('post');
        /**
        * 向指定的URL地址挂载中间件,这些挂载的中间件是为get请求准备的
        *
        * 可以只传入中间件,这个时候URL使用构造函数中传入的内容作为URL
        * @param url URL地址
        * @param middleware URL对应的中间件
        */
        this.delete = CraeteMethodsForControllerGenerator('delete');
        /**
        * 向指定的URL地址挂载中间件,这些挂载的中间件是为get请求准备的
        *
        * 可以只传入中间件,这个时候URL使用构造函数中传入的内容作为URL
        * @param url URL地址
        * @param middleware URL对应的中间件
        */
        this.put = CraeteMethodsForControllerGenerator('put');
    }
    /**
     * 在调用任意一个添加中间件方法后,
     * 调用用该本方法则对该方法以及对应的URL添加前置中间件.
     * @param rest 需要添加的前置中间件的名称
     */
    before(...rest) {
        if (!this.lastCallMethodName) {
            throw new Error("after invoke other methods then you can invoke the before method");
        }
        const middlewareNames = this.beforeMiddlewares[this.lastCallMethodName].find(elem => elem.url === this.lastCallMethodUrl);
        middlewareNames.MiddlewaresNames.push(...rest);
        return this;
    }
    /**
     * 内部方法
     * 设置本次调用的方法名称
     * 只能被get post delete put方法调用
     * @param name 方法名称
     */
    setThisTimeMethodName(name) {
        this.lastCallMethodName = name;
        return this;
    }
    /**
     * 内部方法
     * 设置本次调用的URL地址
     * 只能被get post delete put方法调用
     * @param url 挂载的url
     */
    setThisTimeUrl(url) {
        this.lastCallMethodUrl = url;
        return this;
    }
    [Symbol.iterator]() {
        let index = 0, len = this.sets.length;
        const i = {
            next: () => {
                return (index < len ? { value: this.sets[index++], done: false } : { value: undefined, done: true });
            }
        };
        return i;
    }
}
exports.ControllerGenerator = ControllerGenerator;
