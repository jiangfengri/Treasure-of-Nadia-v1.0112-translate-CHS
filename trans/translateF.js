let fs = require("fs")
let path = require("path")

/**
 * 根据*.json.txt对JSON直接替换
 * 
 * 1. fn.json.txt
 *    对含有\\fn(指名字体)进行替换
 *        采用replaceAll的形式替换，注意保证正确性
 *        尽可能去掉左右表示命令的标识符
 *        仍然8位一个空格
 *        一页：101 401文本样式 401文本
 * 
 * 
 */

// 加载本地*.json.txt：加载
everyFileoffline()

// 美化本地fn.txt并保存，美化后会影响内容！！！还要修改fn.json.txt
// beautyFnOffline()





function everyFileoffline() {
  console.log('开始加载本地*.json.txt...');
  let dataDir = path.join(__dirname,"../www/data")
  let saveFnDir = path.join(__dirname,'fMap')
  let featureList = fs.readdirSync(saveFnDir)
  featureList = featureList.filter(item => {
    return /.+\.json\.txt/.test(item)
  })
  featureList.forEach(featureName => {
    console.log('开始加载本地'+ featureName +'...');
    let obj = JSON.parse(fs.readFileSync(path.join(saveFnDir,featureName),"utf-8"))
    let fileNameList = Object.getOwnPropertyNames(obj)
    fileNameList.forEach(fileName => {
      let filePath = path.join(dataDir,fileName)
      loadF(fileName, filePath, obj[fileName])
    })
    console.log(featureName +'加载完成\n');
  })
  console.log('本地*.json.txt加载完成\n');
}

// 加载某个.json.txt
function loadF(fileName, filePath, obj) {
  console.log('开始加载'+ fileName +'...');
  let data = fs.readFileSync(filePath,"utf-8")
  // 直接文本替换
  Object.getOwnPropertyNames(obj).forEach(item => {
    // 将item中的元字符转换
    let outItem = JSON.stringify(item).slice(1,-1)
    let ch = JSON.stringify(obj[item]).slice(1,-1)
    let safeItem = outItem.replace(/[\(\)\[\]\{\}\\\^\$\?\*\.\+\|]/g,"\\$&")
    data = data.replace(new RegExp(safeItem,'g'), ch)
  })

  fs.writeFileSync(filePath, data)
  console.log(fileName +'加载完成\n');
}

function beautyFnOffline() {
  console.log('开始美化本地*.txt...');
  let saveFnDir = path.join(__dirname,'fMap')
  let featureList = fs.readdirSync(saveFnDir)
  featureList = featureList.filter(item => {
    return /.+\.txt/.test(item)
  })
  featureList.forEach(featureName => {
    console.log('开始美化本地'+ featureName +'...');
    let obj = JSON.parse(fs.readFileSync(path.join(saveFnDir,featureName),"utf-8"))
    // 特征文件里的每个文件的中文翻译每8位加空格
    beautyFn(obj)
    obj = JSON.stringify(obj)
    // json字符串""内不允许出现\n等
    obj = obj.replace(/":"/g,'":\n"')
    obj = obj.replace(/","/g,'",\n"')
    fs.writeFileSync(path.join(saveFnDir,featureName+'.txt'),obj)
    console.log(featureName+'美化完成\n');
  })
  console.log('本地*.txt美化完成\n');
}

function beautyFn(obj) {
  Object.getOwnPropertyNames(obj).forEach(fileName => {
    Object.getOwnPropertyNames(obj[fileName]).forEach(item => {
      // 先移除value中空格
      obj[fileName][item] = obj[fileName][item].replace(/ /g, '')
      // 再添加空格
      obj[fileName][item] = obj[fileName][item].replace(/\S{8}/g,'$& ')
    })
  })
}