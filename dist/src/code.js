"use strict";
/**
 *
 * 8300 + 会话代码
 * 8400 + 资源代码
 *
 * 8500 + 包含以上内容,且视为危险
 */
Object.defineProperty(exports, "__esModule", { value: true });
// see https://github.com/zhongsp/TypeScript/blob/master/doc/wiki/coding_guidelines.md#%E9%94%99%E8%AF%AF%E6%8F%90%E7%A4%BA%E4%BF%A1%E6%81%AF%E4%BB%A3%E7%A0%81
var ResponseError;
(function (ResponseError) {
    ResponseError[ResponseError["\u8B66\u544A:\u60A8\u6B63\u5728\u4F7F\u7528\u8FC7\u671F\u7684\u4F1A\u8BDD,\u8BF7\u6E05\u7A7A\u5BA2\u6237\u7AEF\u7F13\u5B58,\u4EE5\u514D\u53D1\u751F\u610F\u5916\u9519\u8BEF."] = 8300] = "\u8B66\u544A:\u60A8\u6B63\u5728\u4F7F\u7528\u8FC7\u671F\u7684\u4F1A\u8BDD,\u8BF7\u6E05\u7A7A\u5BA2\u6237\u7AEF\u7F13\u5B58,\u4EE5\u514D\u53D1\u751F\u610F\u5916\u9519\u8BEF.";
    ResponseError[ResponseError["\u9519\u8BEF:\u8BE5\u8DEF\u5F84\u4E0B\u6CA1\u6709\u53EF\u4EE5\u8BBF\u95EE\u7684\u5185\u5BB9"] = 8401] = "\u9519\u8BEF:\u8BE5\u8DEF\u5F84\u4E0B\u6CA1\u6709\u53EF\u4EE5\u8BBF\u95EE\u7684\u5185\u5BB9";
    ResponseError[ResponseError["404 Not Found!"] = 8404] = "404 Not Found!";
})(ResponseError = exports.ResponseError || (exports.ResponseError = {}));
var FilterCode;
(function (FilterCode) {
    FilterCode[FilterCode["\u9519\u8BEF:\u975E\u6CD5\u8BF7\u6C42"] = 8501] = "\u9519\u8BEF:\u975E\u6CD5\u8BF7\u6C42";
    FilterCode[FilterCode["\u9519\u8BEF:\u6743\u9650\u4E0D\u8DB3"] = 8002] = "\u9519\u8BEF:\u6743\u9650\u4E0D\u8DB3";
})(FilterCode = exports.FilterCode || (exports.FilterCode = {}));
