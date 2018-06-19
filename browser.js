/** ! browser.js
 * https://github.com/gucong3000/browser.js#readme
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

(function (root, factory) {
	"use strict";
	/* global define, exports, module */
	if (typeof define === "function" && define.amd) {
		// AMD. Register as an anonymous module.
		define(factory);
	} else if (typeof exports === "object") {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory();
	} else if (root.$) {
		// Register as an jQuery plugin
		root.$.browser = factory();
	} else {
		// Browser globals (root is window)
		root.browser = factory();
	}
}(this, function () {
	"use strict";
	var win = window,
		nav = win.navigator,
		doc = win.document,
		regAreaCode = /-\w+$/,
		// documentMode is an IE-only property
		// https://msdn.microsoft.com/library/cc196988%28v=vs.85%29.aspx
		documentMode = doc.documentMode,
		compatMode = doc.compatMode,
		appVersion = nav.appVersion,
		userAgent = nav.userAgent,
		langs = "languages",
		lang = "language",
		opera = win.opera,
		result = {},
		rv,
		jscript = (function () {
			// 微软的JScript语言独有的条件注释语句,！！！勿删！！！返回js引擎的版本号
			/* @cc_on return @_jscript_version;@ */

			// IE11不再使用JScript语言
			if (documentMode && isMs()) {
				// IE11
				return Math.max(11, documentMode);
			}
		})();
	// 判断是否微软浏览器（不能判断IE8及以下）
	function isMs () {
		for (var key in nav) {
			if (/^ms[A-Z]\w+/.test(key)) {
				return true;
			}
		}
	}

	if (!/\)$/.test(appVersion)) {
		userAgent = appVersion;
	} else {
		userAgent = userAgent.replace(/^Mozilla\/\d[\w.]+\s*/, "");
	}

	if (jscript) {
		/*
		 *	IE浏览器版本获取思路
		 *	IE9-11， js引擎版本号与浏览器版本号相同
		 *	有document.documentMode，说明IE8以上
		 *	有XMLHttpRequest，说明IE7以上
		 *	有compatMode，说明IE6以上
		 */

		// IE版本，MSIE为文档模式，version为浏览器版本
		rv = jscript > 8 ? jscript : compatMode ? "XMLHttpRequest" in win ? documentMode ? 8 : 7 : 6 : 5;

		// result.MSIE直接采用document.documentMode，IE6\7浏览器按高版IE的documentMode规则计算
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
				Safari: "Version\\/",
				Gecko: "rv:",
				Version: 0,
				rv: 0,
				Webkit: "\\w+WebKit\\/"
			},
			// Safari 和后来其他基于AppleWebKit引擎开发的浏览器中`navigator.productSub`总是等于`20030107`，参见: http://stackoverflow.com/questions/13880858/why-does-navigator-productsub-always-equals-20030107-on-chrome-and-safari
			isWebkit = nav.productSub === "20030107",
			isChrome = win.chrome || /^Google\b/.test(nav.vendor),
			isGecko = win.netscape;

		// Edge浏览器在模仿webkit，所以最先排除掉
		var is = isMs() ? {
			// EDGE浏览器内核
			Edge: 1,
			Chrome: false
		} : (isWebkit ? {
			// webkit浏览器内核身世复杂，所以第二个排除
			Chrome: isChrome,
			Safari: !isChrome,
			Webkit: isWebkit
		} : {
			// 其他浏览器内核，其中Khtml是瞎猜的
			Khtml: !isGecko,
			Gecko: isGecko
		});

		// is 中列举的了字段，一一去useragent中查找版本号
		for (var key in is) {
			if (is[key]) {
				result[key] = new RegExp("\\b" + (keyMap[key] ? keyMap[key] : (key + "\\/")) + "(\\d+[\\w.]+)").test(userAgent) ? RegExp.$1 : !!is[key];
			}
		}

		// 查查userAgent中还有哪些没有列举的版本号，除了黑名单中的之外，放result中
		userAgent.replace(/(\w+)\/(\d+[\w.]+)/g, function (str, name, val) {
			if (!/^\w+WebKit$/.test(name) && !(name in keyMap) && !(name in is)) {
				result[name] = val;
			}
		});
	}

	/**
	 * 将Mac、IOS风格的版本号转换为传统风格
	 * @param  {String} str 以下划线分隔的版本还字符串
	 * @return {String||Boolean}     以小数点分隔的版本还字符串，若失败返回true
	 */
	function parseVerStr (str) {
		return str ? str.replace(/_/g, ".") : true;
	}

	try {
		// 浏览器语言代码统一大小写格式(最后两位大写)
		nav[lang] = nav[lang].replace(regAreaCode, function (str) {
			return str.toUpperCase();
		});
	} catch (ex) {

	}

	/**
	 * 获取`navigator.languages`中的最后一项
	 * @return {[type]} [description]
	 */
	function getLastLang () {
		return nav[langs][nav[langs].length - 1];
	}

	// 浏览器语言，若不支持`navigator.languages`
	if (!nav[langs]) {
		nav[langs] = [nav[lang]];
		// 使用语言代码去掉国家后缀的办法脑补其他语言设置
		while (regAreaCode.test(getLastLang())) {
			nav[langs].push(getLastLang().replace(regAreaCode, ""));
		}
	}

	// ["zh-CN", "zh"]
	result[langs] = nav[langs];

	userAgent = userAgent
		.replace(/^.*?\((.*?)\).*$/, "$1")
		.replace(/\bWin(?:dows(?:\sNT)?)?\s(\d+[\w.]+)/g, function (str, ver) {
			// 获取Windows版本
			result.Windows = ver;
		});
	if (!result.Windows) {
		userAgent.replace(/;\s*(\w+)\s(\d+[\w.]+)/g, function (str, key, value) {
			// 获取一般的系统版本信息，如Android
			result[key] = value;
		}).replace(/\b(\w+);(?: \w+;)* (CPU|PPC|Intel)(?:(?:(?: iPhone)? OS (\d+\w+))? like)?(?: Mac OS(?: X)?(?: (\d+\w+))?)?\b/g, function (str, device, cpu, iosVer, macVer) {
			if ((macVer && !iosVer) || device === "Macintosh") {
				if (cpu !== "CPU") {
					result.CPU = cpu;
				}
				// 输出OS X版本号
				result[device] = parseVerStr(macVer);
			} else {
				// 输出设备名称，如iPad、iPhone、iPod
				result[device] = true;
				// 输出IOS的版本信息
				result.IOS = parseVerStr(iosVer);
			}
		});
	}

	/**
	 * Properties
	 */
	var reSubPrapName = /([a-z]+[A-Z][a-z]+)[A-Z][a-z]*$/,

		// 对于标准属性名称与私有属性名称有差异的，映射。
		propNameMap = {
			offlineAudioContext: "OfflineAudioContext",
			audioContext: "AudioContext",
			enterFullscreen: "requestFullscreen",
			exitFullscreen: "cancelFullscreen",
			matchesSelector: "matches"
		},
		Object = win.Object,
		prefix = {},
		currStyle,
		propName;

	/**
	 * 修复对象成员的名称为无私有前缀的
	 * @param  {Object} obj         要修的对象
	 * @param  {String} oldPropName 要修的属性名称
	 * @param  {Object} testObj     测试是否需要修所用的对象，留空则使用obj测试
	 * @return {Object}             若进行了修复，返回修复后的对象
	 */
	function fixPorpName (obj, oldPropName, testObj) {
		// webkitURL 形式转为 URL，MozAppearance转为appearance，webkitAppearance转为appearance
		var newPropName = oldPropName.replace(/^(?:[A-Z]?[a-z]+|Ms|O)([A-Z])(\w)/, function (s, letter1, letter2) {
			if (/[a-z]/.test(letter2)) {
				letter1 = letter1.toLowerCase();
			}
			return letter1 + letter2;
		}).replace(/(F|f)ullScreen/, "$1ullscreen");
		var objType;

		testObj = testObj || obj;
		newPropName = propNameMap[newPropName] || newPropName;

		if (!(newPropName in testObj || testObj[newPropName] || (newPropName[0].toUpperCase() + newPropName.slice(1)) in testObj)) {
			objType = obj.constructor.name;
			if (!objType) {
				try {
					objType = String(obj).replace(/.*\[\w+\s+(\w+?)(?:Prototype)?\].*/, "$1");
				} catch (ex) {
					objType = "Window";
				}
			}

			if (win[objType]) {
				obj = win[objType].prototype || obj;
			}
			(prefix[objType] = prefix[objType] || {})[oldPropName] = newPropName;
			Object.defineProperty(obj, newPropName, {
				get: function () {
					return this[oldPropName];
				},
				set: function (val) {
					this[oldPropName] = val;
				},
				enumerable: true
			});
			return obj;
		}
	}

	/**
	 * 判断对象的属性名是否有前缀
	 * @param  {String}  propName 对象的属性名
	 * @return {Boolean}          手否有前缀
	 */
	function hasPreFix (propName) {
		// 最新版本的火狐和EDGE浏览器，开始使用webkit的私有属性前缀，所以这里不预先判断前缀名，而是运行时抓。
		return (opera ? /^(?:o[A-Z]|O[A-Z][a-z])/ : /^(?:[Ww]ebkit|[Kk]html|[Mm]oz|[Mm]s)[A-Z]/).test(propName);
	}

	/**
	 * 修复CSSStyleDeclaration.prototype的成员的名称为无私有前缀的
	 * @param  {String}  propName DOM风格的CSS属性名
	 */
	function fixCssProp (propName) {
		// 如果该css属性修复成功，且他有父级属性，如fontSize的父级属性为font
		if (fixPorpName(win.CSSStyleDeclaration.prototype, propName, currStyle) && reSubPrapName.test(propName)) {
			// 修复父级属性
			fixCssProp(propName.replace(reSubPrapName, "$1"));
		}
	}

	/**
	 * 检查CSS属性名是否需要修复，需要则修复，不需要则啥都不做
	 * @param  {String} propName css属性名
	 */
	function checkCssProp (propName) {
		// -webkit-prop式的属性名
		if (/^-[a-z]+-\w/.test(propName)) {
			// 属性名转为Dom风格的camelCase命名风格
			propName = propName.replace(/-([a-z])/g, function ($0, $1) {
				return $1.toUpperCase();
			});
		} else if (!hasPreFix(propName)) {
			// 属性名无前缀，无需修复
			return;
		}
		// 修复该属性名
		fixCssProp(propName);
	}

	/**
	 * 检查对象私有属性是否其原型链上的对象所定义的。
	 * @param  {Object} prototype 原型对象
	 * @param  {String} propName  属性名
	 * @return {[type]}           父类是否有此属性
	 */
	function checkParentPrototype (prototype, propName) {
		var parentPrototype = Object.getPrototypeOf(prototype);
		if (propName in parentPrototype) {
			// propName属性在弗雷上发现
			if (!checkParentPrototype(parentPrototype, propName)) {
				// 父类的父类没有定义，才修复当前元素
				fixPorpName(parentPrototype, propName);
			}
			return true;
		} else {
			return false;
		}
	}

	if (Object.getPrototypeOf) {
		// 必须先修复CSS的私有属性前缀，否则CSSStyleDeclaration对象将被修复在其子类CSS2Properties上，这时貌似checkParentPrototype函数没有起到作用
		currStyle = win.getComputedStyle(doc.createElement("div"), null);
		// Some browsers have numerical indices for the properties, some don't
		if (currStyle.length > 0) {
			[].slice.call(currStyle, 0).forEach(checkCssProp);
		} else {
			for (propName in currStyle) {
				checkCssProp(propName);
			}
		}

		// 遍历window对象下面的所有成员
		Object.getOwnPropertyNames(win).forEach(function (obj) {
			try {
				if (hasPreFix(obj)) {
					// win[obj]成员的名称有前缀，修复
					fixPorpName(win, obj);
				} else if (win[obj] && /^[A-Z]/.test(obj)) {
					// win[obj]是个DOM对象原型，修复其prototype
					// issues #1 'undefined' is not an object (evaluating 'win[obj].prototype')
					obj = win[obj].prototype;

					for (var propName in obj) {
						if (hasPreFix(propName)) {
							// 发现属性名propName需要修复
							if (!checkParentPrototype(obj, propName)) {
								// 如果propName不是在其原型链上对的元素定义的，那修复当前对象
								fixPorpName(obj, propName);
							}
						}
					}
				}
			} catch (ex) {
				//
			}
		});

		result.prefix = prefix;
	}
	return result;
}));
