import { RequestHaveSession, ParsedSessionNew } from "../types";

/**
 * 用于向含有session的请求写入格式正确的用户信息
 * @param request 请求对象
 * @param data 要挂载的session数据
 */
export const setInfoToSession = (request: RequestHaveSession, data: ParsedSessionNew)=>{
  for (const keyName of Object.keys(data)) {
    request.session[keyName] = data[keyName];
  }
}