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
				Gecko: "rv:",
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

	/**************************************
	 * Properties
	 **************************************/
	var reSubPrapName = /([a-z]+[A-Z][a-z]+)[A-Z][a-z]*$/,
		propNameMap = {
			matchesSelector: "matches"
		},
		Object = win.Object,
		currStyle,
		propName;

	// 修复各种对象中，名称以私有前缀开头的成员
	function fixPorpName(obj, oldPropName, testObj) {
		var newPropName = oldPropName.replace(/^(?:[a-z]+|Ms|O)([A-Z])(\w)/, function(s, letter1, letter2) {
			if (/[a-z]/.test(letter2)) {
				letter1 = letter1.toLowerCase();
			}
			return letter1 + letter2;
		});
		newPropName = propNameMap[newPropName] || newPropName;
		if (!(newPropName in (testObj || obj))) {
			Object.defineProperty(obj, newPropName, {
				get: function() {
					return this[oldPropName];
				},
				set: function(val) {
					this[oldPropName] = val;
				},
				enumerable: true
			});
			console.log(newPropName + "\t" + oldPropName, obj);
			return obj;
		}
	}

	function hasPreFix(propName) {
		return (opera ? /^(?:o[A-Z]|O[A-Z][a-z])/ : /^(?:webkit|khtml|moz|ms|Ms)[A-Z]/).test(propName);
	}

	function fixStyle(propName) {
		if (fixPorpName(win.CSSStyleDeclaration.prototype, propName, currStyle) && reSubPrapName.test(propName)) {
			fixStyle(propName.replace(reSubPrapName, "$1"));
		}
	}

	function styleForEach(propName) {
		if (/^-[a-z]+-\w/.test(propName)) {
			propName = propName.replace(/-([a-z])/g, function($0, $1) {
				return $1.toUpperCase();
			});
		} else if (!hasPreFix(propName)) {
			return;
		}
		fixStyle(propName);
	}

	if (Object.getPrototypeOf) {
		Object.getOwnPropertyNames(win).forEach(function(obj) {
			if (hasPreFix(obj)) {
				fixPorpName(win, obj);
			} else if (/^[A-Z]/.test(obj)) {
				obj = win[obj].prototype;

				for (var propName in obj) {
					if (hasPreFix(propName)) {
						fixPorpName(obj, propName);
					}
				}
			}
		});

		currStyle = win.getComputedStyle(doc.createElement("div"), null);
		// Some browsers have numerical indices for the properties, some don't
		if (currStyle.length > 0) {
			[].slice.call(currStyle, 0).forEach(styleForEach);
		} else {
			for (propName in currStyle) {
				styleForEach(propName);
			}
		}
	}
	return result;
}));