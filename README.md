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

### 程序流程

- 使用正则从`www/data` 获取台词，形成`map`
- 翻译`map`，百度API有频率和大小限制
- 美化`map`加空格，以使台词可以换行）
- 保存到本地`*.json.txt`
- 相同正则替换`www/data`为中文



### translate.js

获取`www/data`中 `*.json`中的台词并翻译，保存到`map`文件夹中



### translateItem.js

获取`www/data`中`items.json`中的物品名并翻译，保存到`itemMap`文件夹中



### translateF.js

根据`*.json.txt`（具有某一特征的翻译`map`）直接对`www/data`中` *.json`进行替换

需要手动提取出特征文件并手动翻译形成`*.txt `，由程序进行美化（添加空格保证能够换行）

为了保证安全性，一定要在`translate.js`和`translateItem.js`替换后再执行



### 注意

由于正则并不完备，需要手动更改保持原英文，以避免报错

机翻，需要润色

并不是解包翻译，翻译并不完全，属于歪门邪道 :(

个人所做的修正和润色记录在`修正润色说明.txt`中




