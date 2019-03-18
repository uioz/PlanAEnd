const noticeModelData = [
  {
    "name": "机电系", "title": "", "notice": "准备删除不存在的机电系",
    "lists": [{
      "name": "测试", "title": "", "notice": "",
      "lists": []
    }]
  }, {
    "name": "信息工程系", "title": "", "notice": "",
    "lists": [{
      "name": "计算机技术", "title": "", "notice": "",
      "lists": [{
        "name": "计算机应用技术", "title": "", "notice": "",
        "lists": []
      }, {
        "name": "移动应用开发", "title": "", "notice": "",
        "lists": []
      }]
    },
    {
      "name": "环境艺术设计", "title": "", "notice": "",
      "lists": [{
        "name": "室内设计", "title": "", "notice": "",
        "lists": []
      }]
    }]
  },
  {
    "name": "艺术系", "title": "", "notice": "",
    "lists": [{
      "name": "动漫制作", "title": "", "notice": "",
      "lists": []
    }]
  }];

const specialityModelData = {
  "信息工程系": {
    "计算机技术": ["计算机应用技术", "移动应用开发"],
    "环境艺术设计": ["室内设计"]
  },
  "艺术系": ["动漫制作"]
}

const removeRedundancyOnNotcieModel = (noticeModel: Array<any>, specialityModel: Object) => {

  const
    pullAt = (array: Array<any>, index: number) => array.splice(index, 1),
    isFinalResult = data => !data.lists.length;

  const core = (noticeModel: Array<any>, specialityModel: Object | Array<any>, ) => {

    let len = noticeModel.length;

    while (len--) {

      const 
        noticeModelNode = noticeModel[len],
        nodeNameFromNoticeModel = noticeModelNode.name;

      // 如果是是结果节点
      if (isFinalResult(noticeModelNode)) {
        // 如果该通知节点不在专业模型结果集合中存在
        if ((specialityModel as Array<any>).findIndex(result => result === nodeNameFromNoticeModel) === -1) {
          // 移除它
          pullAt(noticeModel, len);
        }

      } else if (noticeModelNode.name in specialityModel) {// 如果存在则递归进入
        core(noticeModelNode.lists, specialityModel[nodeNameFromNoticeModel]);
      } else {
        // 如果是父节点不存在则删除这个通知节点
        pullAt(noticeModel, len);
      }

    }

  }

  core(noticeModel,specialityModel);

  return noticeModel;

}

removeRedundancyOnNotcieModel(noticeModelData,specialityModelData);


