"use strict";
/**
 *
 * 8300 + 会话代码
 * 8400 + 资源代码
 * 8500 + 请求错误
 * 8600 + 数据错误
 */
Object.defineProperty(exports, "__esModule", { value: true });
// see https://github.com/zhongsp/TypeScript/blob/master/doc/wiki/coding_guidelines.md#%E9%94%99%E8%AF%AF%E6%8F%90%E7%A4%BA%E4%BF%A1%E6%81%AF%E4%BB%A3%E7%A0%81
/**
 * 内部使用的错误代码
 */
var SystemErrorCode;
(function (SystemErrorCode) {
    SystemErrorCode[SystemErrorCode["\u8B66\u544A:\u60A8\u6B63\u5728\u4F7F\u7528\u8FC7\u671F\u7684\u4F1A\u8BDD,\u8BF7\u6E05\u7A7A\u5BA2\u6237\u7AEF\u7F13\u5B58,\u4EE5\u514D\u53D1\u751F\u610F\u5916\u9519\u8BEF."] = 8300] = "\u8B66\u544A:\u60A8\u6B63\u5728\u4F7F\u7528\u8FC7\u671F\u7684\u4F1A\u8BDD,\u8BF7\u6E05\u7A7A\u5BA2\u6237\u7AEF\u7F13\u5B58,\u4EE5\u514D\u53D1\u751F\u610F\u5916\u9519\u8BEF.";
    SystemErrorCode[SystemErrorCode["\u9519\u8BEF:\u8BE5\u8DEF\u5F84\u4E0B\u6CA1\u6709\u53EF\u4EE5\u8BBF\u95EE\u7684\u5185\u5BB9."] = 8401] = "\u9519\u8BEF:\u8BE5\u8DEF\u5F84\u4E0B\u6CA1\u6709\u53EF\u4EE5\u8BBF\u95EE\u7684\u5185\u5BB9.";
    SystemErrorCode[SystemErrorCode["404 Not Found!"] = 8404] = "404 Not Found!";
})(SystemErrorCode = exports.SystemErrorCode || (exports.SystemErrorCode = {}));
/**
 * 对外可以响应的错误代码
 */
var ResponseErrorCode;
(function (ResponseErrorCode) {
    ResponseErrorCode[ResponseErrorCode["\u9519\u8BEF:\u975E\u6CD5\u8BF7\u6C42"] = 8501] = "\u9519\u8BEF:\u975E\u6CD5\u8BF7\u6C42";
    ResponseErrorCode[ResponseErrorCode["\u9519\u8BEF:\u6743\u9650\u4E0D\u8DB3"] = 8002] = "\u9519\u8BEF:\u6743\u9650\u4E0D\u8DB3";
    ResponseErrorCode[ResponseErrorCode["\u9519\u8BEF:\u8868\u5355\u4E0A\u4F20\u9519\u8BEF"] = 8406] = "\u9519\u8BEF:\u8868\u5355\u4E0A\u4F20\u9519\u8BEF";
    ResponseErrorCode[ResponseErrorCode["\u9519\u8BEF:\u6570\u636E\u6821\u9A8C\u9519\u8BEF"] = 8407] = "\u9519\u8BEF:\u6570\u636E\u6821\u9A8C\u9519\u8BEF";
    ResponseErrorCode[ResponseErrorCode["\u9519\u8BEF:\u5730\u5740\u53C2\u6570\u9519\u8BEF"] = 8508] = "\u9519\u8BEF:\u5730\u5740\u53C2\u6570\u9519\u8BEF";
    ResponseErrorCode[ResponseErrorCode["\u9519\u8BEF:\u6E90\u6570\u636E\u5199\u5165\u5931\u8D25"] = 8600] = "\u9519\u8BEF:\u6E90\u6570\u636E\u5199\u5165\u5931\u8D25";
    ResponseErrorCode[ResponseErrorCode["\u9519\u8BEF:\u65E0\u6CD5\u83B7\u53D6\u96C6\u5408\u4FE1\u606F"] = 8601] = "\u9519\u8BEF:\u65E0\u6CD5\u83B7\u53D6\u96C6\u5408\u4FE1\u606F";
})(ResponseErrorCode = exports.ResponseErrorCode || (exports.ResponseErrorCode = {}));
/**
 * 不同等级之间的状态码
 *
 * 有两种使用方式,
 * 1. 将几个值相然后判断大小确认是否有能力
 * 2. 利用Index和Raw判断是否存在对应的位确认是否有能力
 */
var LevelCode;
(function (LevelCode) {
    LevelCode[LevelCode["SuperUser"] = Number(0b0000000)] = "SuperUser";
    LevelCode[LevelCode["Management"] = Number(0b1100000)] = "Management";
    LevelCode[LevelCode["Download"] = Number(0b1010000)] = "Download";
    LevelCode[LevelCode["Edit"] = Number(0b1001000)] = "Edit";
    LevelCode[LevelCode["Upload"] = Number(0b1000100)] = "Upload";
    LevelCode[LevelCode["StaticMessage"] = Number(0b1000010)] = "StaticMessage";
    LevelCode[LevelCode["View"] = Number(0b1000001)] = "View";
    LevelCode[LevelCode["SuperUserIndex"] = 0] = "SuperUserIndex";
    LevelCode[LevelCode["ManagementIndex"] = 1] = "ManagementIndex";
    LevelCode[LevelCode["DownloadIndex"] = 2] = "DownloadIndex";
    LevelCode[LevelCode["EditIndex"] = 3] = "EditIndex";
    LevelCode[LevelCode["UploadIndex"] = 4] = "UploadIndex";
    LevelCode[LevelCode["StaticMessageIndex"] = 5] = "StaticMessageIndex";
    LevelCode[LevelCode["ViewIndex"] = 6] = "ViewIndex";
})(LevelCode = exports.LevelCode || (exports.LevelCode = {}));
