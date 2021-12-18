# Treasure-of-Nadia-v1.0112-汉化
Treasure of Nadia v1.0112版本的汉化程序，文档

目前只适用于`v1.0112`版本。将`trans`和`pacakge.json`放入根目录即可。

不能完美适用于steam版，这里给出汉化流程，如有兴趣可自己操作。



### steam版本问题

1. （2021/12/13 15点）

   steam版本不是最终v1.0112版，是比较落后的版本。

   ----------我看到有关游戏版本更新的讨论，引用如下--------------

   Kamote  21 小时以前 
   Any updates?
   Will there be an update soon?

   tictac 16 小时以前     

   The final version was released in their Patreon site. The steam version will be updated to the final version soon with steam special bonus content.

## trans

### translate.js

获取`www/data`中 `*.json`中的台词并翻译，保存到`map`文件夹中。

#### 完整流程

- 使用正则从`www/data` 获取台词，形成`map`
- 翻译`map`，百度API有频率和大小限制
- 美化`map`，其中操作有：确保`num=xx]`的样式，加空格以使台词可以换行。
- 保存到本地`map`文件夹中`*.json.txt`
- 相同正则替换`www/data`中 `*.json`为中文



### translateItem.js

获取`www/data`中`items.json`中的物品名并翻译，保存到`itemMap`文件夹中。

#### 完整流程

- 使用正则从`www/data/items.json` 获取物品名，形成`map`
- 翻译`map`，百度API有频率和大小限制
- 美化`map`，其中操作有：确保`num=xx]`的样式
- 保存到本地`itemMap`文件夹中`Items.json.txt`
- 相同正则替换`www/data/items.json`为中文



### translateF.js

根据`fMap`中`*.txt.json`（具有某一特征的翻译`map`）直接对`www/data`中` *.json`进行替换

#### 完整流程

- 手动提取出某特征文本并手动翻译形成`*.txt `
- 美化，其中操作有：加空格以使台词可以换行。
- 保存到本地`fMap`文件夹中`*.txt.json`
- 读取`*.txt.json`，对`www/data/*.json`直接进行`replaceAll`

为了保证安全性，一定要在`translate.js`和`translateItem.js`替换后再执行



### 注意

由于正则并不完备和美化中的加空格操作，需要审查，保持必要的原英文，以避免报错

机翻，需要润色

并不是解包翻译，翻译并不完全，属于歪门邪道 :(

个人所做的修正和润色记录在`修正润色说明.txt`中



## trans need plugin to wrap

移除美化中加空格的策略，使用修改版插件`YEP_MessageCore.js`来帮助换行，

- 把`YEP_MessageCore.js`替换掉原来`www/js/plugins/YEP_MessageCore.js`

- 确保`www/js/plugins.js`中`YEP_MessageCore`的`parameters`中有`"Word Wrapping":"true"`即可

该插件支持了中文换行，但英文的换行会退化成字母换行。

https://github.com/XMandarava/Plugins4RMMV/tree/master/modified

 


