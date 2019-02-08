import globalData from "../globalData";
import { createCollection } from "../DAO/collectionCreate";

export default async function (databaseList: Array<any>, configDir: string) {

    const
        systemConfig = globalData.getConfig('systemConfig'),
        // 配置文件中的所有存在的文档名称的集合
        collectionNameList = systemConfig.system.mongodbCollectionList,
        // 数据库对象
        database = globalData.getMongoDatabase();
        
    // TODO 目前使用固化在代码中的数据库初始化数据
    return await createCollection('configuration_static', database, {
        force: true,
        insertData: globalData.getConfig('systemConfig')
    });

    // for (const collectionName of collectionNameList) {
    //     // 使用下划线结尾的是按照年份动态建立的,不考虑这些集合的创建
    //     if (!/_$/.test(collectionName)){

    //     }
    // }
}