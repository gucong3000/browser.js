/* browser.js
 * https://github.com/gucong3000/browser.js
 */
/*
 * define.amd存在时自动注册为其匿名模块
 * 无define但是有$时注册为其成员$.browser
 * 无define也无$时注册为全局变量
 * DEMO:
	for(var i in browser){
		document.writeln(i + ":\t" + browser[i] + "<br>");
	}
 */

(function(root, factory) {
	if (typeof define === "function" && (define.amd || define.cmd)) {
		// AMD. CMD. Register as an anonymous module.
		define(factory);
	} else {
		// Browser globals
		(root.$ || root).browser = factory();
	}
}(this, function() {

	"use strict";
	var win = window,
		nav = win.navigator,
		doc = win.document,
		regAreaCode = /\-\w+$/,
		/**
		 * documentMode is an IE-only property
		 * https://msdn.microsoft.com/library/cc196988%28v=vs.85%29.aspx
		 */
		documentMode = doc.documentMode,
		compatMode = doc.compatMode,
		appVersion = nav.appVersion,
		userAgent = nav.userAgent,
		langs = "languages",
		lang = "language",
		opera = win.opera,
		result = {},
		rv,
		jscript = (function() {
			// IE5-10中可获取jscript版本号来推算IE真实版本
			/*@cc_on return @_jscript_version;@*/
			if (documentMode > 10 && isMs()) {
				// IE11
				return documentMode;
			}
		})();

	// 判断是否微软浏览器（不能判断IE8及以下）
	function isMs() {
		for (var key in nav) {
			if (/^ms[A-Z]\w+/.test(key)) {
				return true;
			}
		}
	}

	if (!/\)$/.test(appVersion)) {
		userAgent = appVersion;
	} else {
		userAgent = userAgent.replace(/^Mozilla\/\d[\w\.]+\s*/, "");
	}

	if (jscript) {

		/*
		 *	IE浏览器版本获取思路
		 *	IE9-11， js引擎版本号与浏览器版本号相同
		 *	有document.documentMode，说明IE8以上
		 *	有XMLHttpRequest，说明IE7以上
		 *	有compatMode，说明IE6以上
		 */

		//IE版本，MSIE为文档模式，version为浏览器版本
		rv = jscript > 8 ? jscript : compatMode ? "XMLHttpRequest" in win ? documentMode ? 8 : 7 : 6 : 5;

		//result.MSIE直接采用document.documentMode，IE6\7浏览器按高版IE的documentMode规则计算
		result = {
			MSIE: documentMode || (compatMode === "CSS1Compat" ? rv : 5),
			rv: rv
		};

		if (!nav[lang]) {
			nav[lang] = nav.userLanguage;
		}

	} else if (opera) {
		// Opera 12.x 或更早的版本
		result = {
			Opera: opera.version()
		};
	} else {

		// Gecko内核浏览器和Webkit内核浏览器
		var keyMap = {
				Gecko: "rv",
				Version: 0,
				rv: 0,
				Webkit: "\\w+WebKit\\/"
			},
			isChrome = win.chrome || /^Google\b/.test(nav.vendor),
			isEdge = isMs(),
			isWebkit = nav.productSub === "20030107" && !isEdge;

		var is = {
			Chrome: isChrome && isWebkit,
			Edge: isEdge,
			Gecko: win.netscape && !isEdge,
			Safari: !isChrome && isWebkit,
			Webkit: isWebkit
		};

		// is 中列举的了字段，一一去useragent中查找版本号
		for (var key in is) {
			if (is[key]) {
				result[key] = new RegExp("\\b" + (keyMap[key] ? keyMap[key] : (key + "\\/")) + "(\\d+[\\w.]+)").test(userAgent) ? RegExp.$1 : is[key];
			}
		}

		// 查查userAgent中还有哪些没有列举的版本号，除了黑名单中的之外，放result中
		userAgent.replace(/(\w+)\/(\d+[\w.]+)/g, function(str, name, val) {
			if (!/^\w+WebKit$/.test(name) && !(name in keyMap)) {
				if (!(name in is)) {
					result[name] = val;
				}
			}
		});
	}

	try {
		// 浏览器语言代码统一大小写格式(最后两位大写)
		nav[lang] = nav[lang].replace(regAreaCode, function(str) {
			return str.toUpperCase();
		});
	} catch (ex) {

	}

	function getLastLang() {
		return nav[langs][nav[langs].length - 1];
	}

	if (!nav[langs]) {
		nav[langs] = [nav[lang]];
		// 浏览器语言，若不支持`navigator.language`则使用去国家后缀的办法脑补
		while (regAreaCode.test(getLastLang())) {
			nav[langs].push(getLastLang().replace(regAreaCode, ""));
		}
	}
	result[langs] = nav[langs];

	userAgent = userAgent.replace(/^.*?\((.*?)\).*$/, "$1").
	replace(/\bWin(?:dows(?:\sNT)?)?\s(\d+[\w.]+)/g, function(str, ver) {
		// 获取Windows版本
		result.Windows = ver;
	});
	if (!result.MSIE) {
		userAgent.replace(/;\s*(\w+)\s(\d+[\w.]+)/g, function(str, key, value) {
			// 获取一般的系统版本信息，如Android
			result[key] = value;
		}).replace(/\b(iP\w+);.*?(\d+\w+)/g, function(str, device, ver) {
			// 获取IOS的版本信息
			result[device] = true;
			result.IOS = ver.replace(/_/g, ".");
		});
	}

	// 计算屏幕对角线长度， 小于12英寸的都算移动端
	result.Mobile = result.Mobile || (Math.sqrt(Math.pow(screen.width, 2) + Math.pow(screen.height, 2)) / 96 / (win.devicePixelRatio || 1) < 12);
	return result;
}));