let fs = require("fs")
let path = require("path")
let md5 = require('md5-node')
let axios = require('axios')
let qs = require('qs')

let bdappid = '你的百度翻译api appid'
let bdkey = '你的百度翻译api key'


// 完整流程：getMap -- 翻译---美化 --- 保存 ---加载
// everyFile()

// 加载本地map：加载
everyFileoffline()

// 美化本地map并保存，美化中加了空格，需要再次审查map文件将一些保持原英文
// beautyMapOffline()





function everyFileoffline() {
  console.log('开始加载本地Map...');
  let dataDir = path.join(__dirname, "../www/data")
  let fileNameList = fs.readdirSync(dataDir)
  fileNameList = fileNameList.filter(item => {
    return /\w+(\.json)$/.test(item)
  })
  for (let i = 0; i < fileNameList.length; i++) {
    let fileName = fileNameList[i]
    let filePath = path.join(dataDir, fileName)
    let saveDir = path.join(__dirname)
    loadMap(fileName, filePath, saveDir)
  }
}

function beautyMapOffline() {
  console.log('开始美化本地Map...');
  let saveMapDir = path.join(__dirname, 'map')
  let fileNameList = fs.readdirSync(saveMapDir)
  fileNameList = fileNameList.filter(item => {
    return /\w(\.json\.txt)$/.test(item)
  })
  fileNameList.forEach(fileName => {
    let map = JSON.parse(fs.readFileSync(path.join(saveMapDir, fileName), "utf-8"))
    beautyMap(map)
    map = JSON.stringify(map)
    map = map.replace(/,"/g, ',\n"')
    fs.writeFileSync(path.join(saveMapDir, fileName), map)
    console.log(fileName + '美化完成');
  })


}

// 移除空格，没有的加num= ] 】换成]，再美化value
function beautyMap(map) {
  Object.getOwnPropertyNames(map).forEach(key => {
    // 先移除value中空格
    map[key] = map[key].replace(/ /g, '')
    let num = parseInt(key)
    if (map[key][(num + '').length] != '=') {
      map[key] = num + "=" + map[key]
    }
    let lastChar = map[key][(map[key].length - 1)]
    if (lastChar == '】') {
      map[key] = map[key].slice(0, -1) + ']'
    } else if (lastChar != ']') {
      map[key] = map[key] + ']'
    }
    // 美化value：，。？！：；、]后加空格，同时，里面太长加空格(17)
    map[key] = beautyValue(map[key])
  })
}

// 1. 先移除num=
// 2. 有]保证当作最后一个标点
function beautyValue(value) {
  let num = parseInt(value)
  value = value.slice((num + '=').length)
  let pattern = /([^，。？！：；、]*?)[，。？！：；、\]]/g
  value = value.replace(pattern, (match, p1) => {
    // match后加空格
    let innerStr = p1
    let symbol = match.slice(innerStr.length) + ' '
    // p1里太长加空格：17
    p1 = p1.replace(/.{17}/g, '$& ')
    return p1 + symbol
  })
  return num + '=' + value
}


async function everyFile() {
  console.log('开始完整流程...');
  let dataDir = path.join(__dirname, "../www/data")
  let fileNameList = fs.readdirSync(dataDir)
  fileNameList = fileNameList.filter(item => {
    return /\w+(\.json)$/.test(item)
  })
  for (let i = 0; i < fileNameList.length; i++) {
    let fileName = fileNameList[i]
    let filePath = path.join(dataDir, fileName)
    let map = {}
    getMap(fileName, filePath, map)

    await translateMap(fileName, map)

    let saveDir = path.join(__dirname)
    beautyMap(map)
    saveMap(fileName, saveDir, map)
    loadMap(fileName, filePath, saveDir)
    console.log(fileName + '完成');
  }
}


function getMap(fileName, filePath, map) {
  console.log(fileName + '提取map中...');
  let num = 0
  // 效果未知有$,none：
  let pattern = /(?=\$gameVariables.setValue).*?"(?:(?:(?:[A-Z][a-z][A-Z][A-Za-z]{1,5})|(?:NPC))[#><^!a-c@]*\.)?(?:\/\w*)?(.*)"/
  let ignore = ['none', '$']
  let data = fs.readFileSync(filePath, "utf-8")
  let obj = JSON.parse(data)
  if (obj && obj instanceof Array) {
    obj.forEach(page => {
      if (page) {
        let list = page.list
        if (list) {
          list.forEach(li => {
            let parameters = li.parameters
            if (parameters) {
              parameters.forEach(para => {
                if (typeof (para) === 'string') {
                  if (pattern.test(para)) {
                    // 替换\dHero \dJanet \dKaley 
                    if (RegExp.$1 && !ignore.includes(RegExp.$1)) {
                      let strwithid = num + '=' + RegExp.$1 + ']'
                      strwithid = strwithid.replace(/\dHero/g, 'Henry')
                      strwithid = strwithid.replace(/\dJanet/g, 'Janet')
                      strwithid = strwithid.replace(/\dKaley/g, 'Kaley')
                      map[strwithid] = strwithid
                      num++
                    }
                  }
                }
              })
            }
          })
        }
      }
    })

  } else {
    if (obj.events && obj.events instanceof Array) {
      obj.events.forEach(event => {
        if (event) {
          let pages = event.pages
          if (pages) {
            pages.forEach(page => {
              let list = page.list
              if (list) {
                list.forEach(li => {
                  let parameters = li.parameters
                  if (parameters) {
                    parameters.forEach(para => {
                      if (typeof (para) === 'string') {
                        if (pattern.test(para)) {
                          if (RegExp.$1 && !ignore.includes(RegExp.$1)) {
                            let strwithid = num + '=' + RegExp.$1 + ']'
                            strwithid = strwithid.replace(/\dHero/g, 'Henry')
                            strwithid = strwithid.replace(/\dJanet/g, 'Janet')
                            strwithid = strwithid.replace(/\dKaley/g, 'Kaley')
                            map[strwithid] = strwithid
                            num++
                          }
                        }
                      }
                    })
                  }
                })
              }
            })
          }
        }
      })
    }
  }
  console.log(fileName + '提取map完成');
  // console.log(JSON.stringify(map));
}

// 多次请求，await请求
async function translateMap(fileName, map) {
  console.log(fileName + '翻译map中...');
  let queryList = []
  queryList = getQueryList(map, 5000)
  await everyQuery(queryList, map)
  console.log(fileName + '翻译map完成');
}

// map拆分
function getQueryList(map, limit = 5000) {
  let queryList = []
  // 每10句判断一次
  let allValueList = Object.values(map)
  let query = ''
  let count = 0
  let s = 0
  let e = 0
  while (s < allValueList.length) {
    e = e + 9
    if (e >= allValueList.length) {
      e = allValueList.length - 1
    }
    let temp = allValueList.slice(s, e + 1).join('\n')
    if ((count + temp.length) < limit) {
      if (count == 0) {
        query = temp
      } else {
        query = query + '\n' + temp
      }
      count = query.length
    } else {
      queryList.push(query)
      query = temp
      count = temp.length
    }
    s = e + 1
  }
  if (count > 0) {
    queryList.push(query)
  }
  // [0=xx\n1=xx\n,  ...]
  return queryList
}

// 改为并发请求
async function everyQuery(queryList, map) {
  let promList = []
  for (let i = 0; i < queryList.length; i++) {
    let query = queryList[i]
    let url = 'https://fanyi-api.baidu.com/api/trans/vip/translate'
    let appid = bdappid
    let key = bdkey
    let salt = (new Date).getTime();
    let from = 'en';
    let to = 'zh';
    let str1 = appid + query + salt + key;
    let sign = md5(str1);
    let data = {
      q: query,
      from,
      to,
      appid,
      salt,
      sign
    }
    promList.push(slowQuery(url, data, i, map))
  }
  await Promise.all(promList)
}

function slowQuery(url, data, idx, map) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('块' + idx + '请求翻译：共' + data.q.length + '个字符');
      axios.post(url, qs.stringify(data), {
        headers: { 'content-type': 'application/x-www-form-urlencoded' }
      })
        .then(response => {
          if (response.status == '200') {
            if (response.data.error_code) {
              console.log('块' + idx + '翻译API错误码' + response.data.error_code);
              reject()
            } else {
              // console.log('需要翻译：',data.q);
              // console.log('翻译返回值为：',JSON.stringify(response.data.trans_result));
              // api会对query做修建，导致无法按src识别key。解决：加数字作为id,翻译后还是数字
              // 顺序和num顺序一致
              // console.log('块'+idx+'----------需要翻译句子数',data.q.split('\n').length);
              // console.log('块'+idx+'----------翻译结果数',response.data.trans_result.length);
              let mapNameList = Object.getOwnPropertyNames(map)
              response.data.trans_result.forEach(({ src, dst }) => {
                // 获得id
                let idx = parseInt(src)
                map[mapNameList[idx]] = dst
              })
              console.log('块' + idx + '翻译完成');
              resolve()
            }
          }
        })
        .catch(err => {
          console.log('非200', err);
          reject()
        })
    }, 3000 * (idx + 1))
  })
}

function saveMap(fileName, saveDir, map) {
  let saveMapDir = path.join(saveDir, 'map')
  if (!fs.existsSync(saveMapDir)) {
    fs.mkdirSync(saveMapDir)
  }
  map = JSON.stringify(map)
  map = map.replace(/,"/g, ',\n"')
  fs.writeFileSync(path.join(saveMapDir, fileName + '.txt'), map)
  console.log(fileName + '美化，保存map完成');

}

function loadMap(fileName, filePath, saveDir) {
  let data = fs.readFileSync(filePath, "utf-8")
  // 备份，无用去掉
  // let backupDir = path.join(saveDir,'backup')
  // if(!fs.existsSync(backupDir)) {
  //   fs.mkdirSync(backupDir)
  // }
  let saveMapDir = path.join(saveDir, 'map')
  // fs.writeFileSync(path.join(backupDir, fileName), data)
  let map = JSON.parse(fs.readFileSync(path.join(saveMapDir, fileName + '.txt'), "utf-8"))
  // 安全第一：按原来方式进行替换
  let num = 0
  let pattern = /(?=\$gameVariables.setValue).*?"(?:(?:(?:[A-Z][a-z][A-Z][A-Za-z]{1,5})|(?:NPC))[#><^!a-c@]*\.)?(?:\/\w*)?(.*)"/
  let ignore = ['none', '$']
  let obj = JSON.parse(data)
  if (obj && obj instanceof Array) {
    obj.forEach(page => {
      if (page) {
        let list = page.list
        if (list) {
          list.forEach(li => {
            let parameters = li.parameters
            if (parameters) {
              parameters.forEach((para, idx) => {
                // 格式 $gameVariables.setValue(21, "HeSaOp#>.Hint text goes here");
                // 不格式 $gameVariables.setValue(21, "AbFrEx>./greet");
                // 为了安全，若有重复，只能替换最后一个（避免和$gameVariables.setValue中重复）
                if (typeof (para) === 'string') {
                  if (pattern.test(para)) {
                    if (RegExp.$1 && !ignore.includes(RegExp.$1)) {

                      let originStr = RegExp.$1

                      let strwithid = num + '=' + originStr + ']'
                      strwithid = strwithid.replace(/\dHero/g, 'Henry')
                      strwithid = strwithid.replace(/\dJanet/g, 'Janet')
                      strwithid = strwithid.replace(/\dKaley/g, 'Kaley')
                      // 去] 去数字=
                      let lastIdx = map[strwithid].lastIndexOf(']')
                      let ch = map[strwithid].slice(0, lastIdx)
                      ch = ch.slice((num + '=').length)
                      let lastIndex = para.lastIndexOf(originStr)
                      parameters[idx] = para.slice(0, lastIndex) + ch + para.slice(lastIndex + originStr.length)
                      num++
                    }
                  }
                }
              })
            }
          })
        }
      }
    })
  } else {
    if (obj.events && obj.events instanceof Array) {
      obj.events.forEach(event => {
        if (event) {
          let pages = event.pages
          if (pages) {
            pages.forEach(page => {
              let list = page.list
              if (list) {
                list.forEach(li => {
                  let parameters = li.parameters
                  if (parameters) {
                    parameters.forEach((para, idx) => {
                      // 替换这样的格式 $gameVariables.setValue(21, "Hint text goes here");
                      if (typeof (para) === 'string') {
                        if (pattern.test(para)) {
                          if (RegExp.$1 && !ignore.includes(RegExp.$1)) {

                            let originStr = RegExp.$1

                            let strwithid = num + '=' + originStr + ']'
                            strwithid = strwithid.replace(/\dHero/g, 'Henry')
                            strwithid = strwithid.replace(/\dJanet/g, 'Janet')
                            strwithid = strwithid.replace(/\dKaley/g, 'Kaley')
                            // 去] 去数字=
                            let lastIdx = map[strwithid].lastIndexOf(']')
                            let ch = map[strwithid].slice(0, lastIdx)
                            ch = ch.slice((num + '=').length)
                            let lastIndex = para.lastIndexOf(originStr)
                            parameters[idx] = para.slice(0, lastIndex) + ch + para.slice(lastIndex + originStr.length)
                            num++
                          }
                        }
                      }
                    })
                  }
                })
              }
            })
          }
        }
      })
    }
  }

  // console.log(map);
  // for(let key in map) {
  //   // 转移所有元字符“(”、 “)”、 “[”、 “]”、 “{”、 “}”、 “\”、 “^”、 “$”、 “?”、 “*”、 “.”、“+”、“|”
  //   let safeKey = key.replace(/[\(\)\[\]\{\}\\\^\$\?\*\.\+\|]/g,"\\$&")
  //   data = data.replace(new RegExp(safeKey,'g'),map[key])
  // }

  // console.log(data);
  fs.writeFileSync(filePath, JSON.stringify(obj))
  console.log(fileName + '使用map替换完成');
}
