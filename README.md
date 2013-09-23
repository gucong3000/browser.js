browser.js v0.1
==========

### 最靠谱的浏览器嗅探方式
```bash
browser("msie <= 7"); //IE5\IE6\IE7中返回true
browser("msie || webkit"); IE下或者webkit浏览器下返回true

browser("Webkit"); //Chrome或Safari下返回webkit版本号，其他返回undefined
browser("Safari"); //Safari下返回Safari版本号，其他返回undefined
browser("Chrome"); //Chrome下返回Chrome版本号，其他返回undefined
//以此类推
browser("Sogou"); //搜狗高速模式
browser("Liebao"); //猎豹高速模式
browser("Maxthon"); //遨游高速模式
browser("TheWorld"); //世界之窗高速模式
browser("TaoBrowser"); //淘宝浏览器急速模式
browser("Coolnovo"); //枫树浏览器高速模式
```

### 特性：
- 大小写不敏感，参数中的浏览器名或内核名大小写均可
- 遵循define.amd标准，注册为其匿名模块
- 没有define.amd时优先注册为$.browser或者window.browser