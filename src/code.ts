/**
 * 
 * 8300 + 会话代码
 * 8400 + 资源代码
 * 
 * 8500 + 包含以上内容,且视为危险
 */

// see https://github.com/zhongsp/TypeScript/blob/master/doc/wiki/coding_guidelines.md#%E9%94%99%E8%AF%AF%E6%8F%90%E7%A4%BA%E4%BF%A1%E6%81%AF%E4%BB%A3%E7%A0%81
export enum ResponseError {
    '警告:您正在使用过期的会话,请清空客户端缓存,以免发生意外错误.' = 8300,
    '错误:该路径下没有可以访问的内容' = 8401,
    '404 Not Found!' = 8404,
}

export enum FilterCode {
    '错误:非法请求' = 8501,
    '错误:权限不足' = 8002,
}