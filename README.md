browser.js v0.4
==========

最靠谱的浏览器嗅探方式
--------------------------------------
### 浏览器内核判断
```bash
browser("msie");			//IE下返回IE的文档模式，怪癖模式返回5
browser("version");			//IE下返回真实的IE版本号
browser("webkit");			//Chrome或Safari下返回webkit版本号，其他返回undefined
browser("Presto");			//Opera 12或以下 返回Presto版本号
browser("Gecko");			//Firefox中返回Gecko版本号
browser("Chrome");			//基于Chrome二次开发的浏览器中返回Chrome版本号
```

### 表达式计算
```bash
if(browser("msie != version") {
	alert("建议使用“标准文档模式”浏览本站");
}
if(browser("Safari < 5.1.2")){
	alert("您的Opera该升级了");
}
browser("msie || webkit");	//IE下或者webkit浏览器下返回true
```

### 浏览器语言判断
```bash
browser("language");	//中文用户返回zh-CN
```

### 浏览器外壳判断
```bash
browser("Safari");		//Safari下返回Safari版本号，其他返回undefined
browser("Chrome");		//Chrome下返回Chrome版本号，其他返回undefined
browser("Sogou");		//搜狗高速模式true
browser("Liebao");		//猎豹高速模式true
browser("Maxthon");		//遨游高速模式返回版本号
browser("TheWorld");	//世界之窗高速模式true
browser("TaoBrowser");	//淘宝浏览器急速模式true
browser("Coolnovo");	//枫树浏览器高速模式true
```

### 特性：
- 支持IE5-IE11、Webkit、gecko、Presto内核浏览器
- 大小写不敏感，参数中的浏览器名或内核名大小写均可
- 遵循define.amd\define.cmd标准，使用CommonJS或seajs时，自动注册为其匿名模块
- 没有define时优先注册为$.browser或者window.browser
- 能获取版本号的浏览器或内核的版本号时，优先返回版本号，无版本号返回bool值
- 除获取Gecko或Presto版本号以外，不需依赖userAgent，用户自定义useragent不影响浏览器判断和除Gecko或Presto外的版本号获取