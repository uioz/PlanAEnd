import globalData from "../globalData";
import { resolve } from "path";

export default function (databaseList:Array<any>,configDir:string) {

    const 
        systemConfig = globalData.getConfig('systemConfig'),
        collectionNameList = systemConfig.system.mongodbCollectionList;

    for (const collectionName of collectionNameList) {
        // 使用下划线结尾的是按照年份建立的,不考虑这些集合
        if (!/_$/.test(collectionName)){

        }
    }
        

    console.log(collectionNameList);


}