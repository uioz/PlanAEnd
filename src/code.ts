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

/**
 * 不同等级之间的状态码
 * 
 * 有两种使用方式,
 * 1. 将几个值相然后判断大小确认是否有能力
 * 2. 利用Index和Raw判断是否存在对应的位确认是否有能力
 */
export enum LevelCode{
    'SuperUser'= Number(0b0000000),
    'Management' = Number(0b1100000),
    'Download' = Number(0b1010000),
    'Edit' = Number(0b1001000),
    'Upload'= Number(0b1000100),
    'StaticMessage' = Number(0b1000010),
    'View' = Number(0b1000001),
    'SuperUserIndex' = 0,
    'ManagementIndex' = 1,
    'DownloadIndex' = 2,
    'EditIndex' = 3,
    'UploadIndex' = 4,
    'StaticMessageIndex' = 5,
    'ViewIndex' = 6
}