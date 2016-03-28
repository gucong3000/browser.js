browser.js v0.8
==========

最靠谱的浏览器嗅探方式
--------------------------------------
### 浏览器内核判断
```Javescript
browser.Chrome			// Chrome和基于Chromium二次开发的浏览器中返回Chrome版本号
browser.Edge			// 微软Win10中的Edge浏览器下返回版本号
browser.Gecko			// Firefox中返回Gecko版本号
browser.MSIE			// IE下返回IE的文档模式，怪癖模式返回5
browser.rv				// IE下返回真实的IE版本号
browser.Opera			// Opera下 返回Opera版本号
browser.Safari			// Safari下返回Safari版本号(Maxthon算基于Safari开发的浏览器)
browser.WebKit			// Chrome或Safari等webkit内核浏览器下返回webkit版本号
```

### 平台判断
```Javescript
browser.Android			// Android卓版本号
browser.Macintosh		// OS X 版本号
browser.CPU				// OS X 下返回CPU类型
browser.IOS				// IOS版本号
browser.iPad			// 是否运行于iPad
browser.iPhone			// 是否运行于iPhone
browser.iPod			// 是否运行于iPod
browser.Windows			// Windows版本号
```

### 其他
```Javescript
browser.languages		// 返回浏览器语言，如`["zh-CN", "zh"]`
browser.prefix			// 已修正的拥有私有属性的对象，及修正后的属性名
```

### 特性：

- 利用DOM特征来判断浏览器，修改UserAgent不影响判断的准确性
- 能获取版本号的浏览器或内核的版本号时，优先返回版本号，无版本号返回bool值
- 修正各浏览器DOM的私有属性前缀
- 遵循amd/umd标准模块规范，当不能注册为js模块时，会依次尝试注册为jQuery插件、全局变量

### 用例

```
// 全屏播放视频，不用再写三种前缀，两种"S"大小写一大堆if判断
vadio.requestFullscreen();

if(browser.rv > browser.MSIE){
	alert("您的IE没有处于标准文档模式");
}
	
```
