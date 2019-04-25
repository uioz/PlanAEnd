/**
 * 
 * 8300 + 会话代码
 * 8400 + 资源代码
 * 8500 + 请求错误
 * 8600 + 数据错误
 */

// see https://github.com/zhongsp/TypeScript/blob/master/doc/wiki/coding_guidelines.md#%E9%94%99%E8%AF%AF%E6%8F%90%E7%A4%BA%E4%BF%A1%E6%81%AF%E4%BB%A3%E7%A0%81

/**
 * 内部使用的错误代码
 */
export enum SystemErrorCode {
    '错误:数据库读取错误' = 8602,
    '错误:数据库写入失败' = 8603,
    '错误:数据库回调异常' = 8604,
    '错误:session移出失败' = 8605,
    '错误:数据转换失败' = 8607,
    '警告:数据校验错误' = 8502,
    '错误:密钥验证错误' = 8503,
    '错误:尝试修改超级管理员' = 8504,
    '错误:匹配数据库数据失败' = 8506,
}

/**
 * 对外可以响应的错误代码
 */
export enum ResponseErrorCode {
    '错误:非法请求' = 8501,
    '错误:权限不足' = 8002,
    '错误:表单上传错误' = 8406,
    '错误:数据校验错误' = 8407,
    '错误:地址参数错误' = 8508,
    '错误:源数据写入失败' = 8600,
    '错误:无法获取集合信息' = 8601
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
    'ViewIndex' = 6,
}

/**
 * 该枚举定义了响应客户端的具体信息
 */
export enum responseMessage {
    '数据上传成功' = '数据上传成功',
    '登陆成功' = '登陆成功',
    '登出成功' = '登出成功',
    '错误:找不到文件' = '找不到文件',
    '错误:服务器错误' = '服务器错误',
    '错误:表单上传错误' = '错误:表单上传错误',
    '错误:地址参数错误' = '错误:地址参数错误',
    '错误:数据校验错误' = '错误:数据校验错误',
    '错误:暂无数据' = '错误:暂无数据',
    '错误:指定的数据不存在' = '错误:指定的数据不存在',
    '错误:用户不存在' = '错误:用户不存在',
    '错误:帐号或者密码错误' = '错误:帐号或者密码错误',
    '错误:重复登录' = '错误:重复登录',
}