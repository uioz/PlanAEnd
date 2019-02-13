import { LevelCode } from "../code";
import { Middleware } from "../types";
import { checkSourceData,StreamReadAsync } from "../../libs/PlanAEnd-source";

/**
 * 数据处理地址
 */
export const URL = '/source';
/**
 * GET下对应的权限下标
 */
export const LevelIndexOfGet = LevelCode.DownloadIndex.toString();
/**
 * POST下对应的权限下标
 */
export const LevelIndexOfPost = LevelCode.UploadIndex.toString();

/**
 * GET下的处理中间件
 */
export const MiddlewaresOfGet:Array<Middleware> = [(request,response)=>{

    // 此时通过的请求都是经过session验证的请求
    // 此时挂载了logger 和 express-session 中间件
    
}]

/**
 * POST下对应的处理中间件
 */
export const MiddlewaresOfPost: Array<Middleware> = [(request,response)=>{

}];