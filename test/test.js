

const patternOfData = new RegExp(`^[\u2E80-\u2EFF\u2F00-\u2FDF\u3000-\u303F\u31C0-\u31EF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FBF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\\w]{1,10}$`);

const checkBody = (data) => {
  if (Array.isArray(data)) {
    for (const item of data) {
      if (!patternOfData.test(item)) {
        throw new Error('The element of Array unable to pass verify.');
      }
    }
    return;
  }

  for (const key of Object.keys(data)) {
    if (patternOfData.test(key)) {
      if (typeof data[key] === 'object') {
        checkBody(data[key]);
      } else {
        throw new Error('The Object-value type is not object or array');
      }

    } else {
      throw new Error(`The Object-key ${key} unable to pass verify.`);
    }
  }
}

try {
  checkBody({
    "信息工程系": {
      "计算机技术": ["计算机应用技术", "移动应用开发"],
      "环境艺术设计": ["室内 设计"]
    },
    "艺术系": ["动漫制作"]
  })
} catch (error) {
  console.log(error.toString());
}