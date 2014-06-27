/* browser.js v0.4
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

(function (root, factory) {
	if (typeof define === "function" && ( define.amd || define.cmd )) {
		// AMD. CMD. Register as an anonymous module.
		define(factory);
	} else {
		// Browser globals
		(root.$ || root).browser = factory();
	}
}(this, function () {

	"use strict";
	var	win = window,
		nav = win.navigator,
		doc = win.document,
		regWebkit = /\w*(WebKit)\b/,
		documentMode = doc.documentMode,
		compatMode = doc.compatMode,
		appVersion = nav.appVersion,
		userAgent = nav.userAgent,
		lang = "language",
		result = {},
		rv,
		jscript = (function(udf){
			/*@cc_on return @_jscript_version @*/
			return udf;
		})();

	//result对象赋值，有版本号信息时遵循版本号，没有时使用bool
	function setrv(name, bool, val){
		bool = !!bool;
		if(bool){
			bool = result[val] || result[name] || bool;
			result[name] = bool;
		} else {
			delete result[name];
		}
	}

	//利用正则在字符串中获取其中一段
	function regSubstr(str, reg){
		return reg.test(str) ? RegExp.$1 : false;
	}

	//读取userAgent中各项信息放进result对象
	function userAgent2result(reg){
		if(jscript) {
			//ie10及以下，只需括号中部分
			userAgent = userAgent.replace(/^[^\(]+\(|\)$/,"");
		} else if(!/\)$/.test(appVersion)){
			//其他浏览器中，若appVersion不是以括号结尾，则使用appVersion代替userAgent
			userAgent = appVersion;
		}
	
		//如果userAgent未曾篡改
		if(reg.test(userAgent)){
			userAgent.replace(/(\w+)\/(\d[\w.]+)/g, function(str, name, val){
				result[regSubstr(name, regWebkit) || name] = val;
			});
		}
	}

	rv = regSubstr(userAgent, /rv:([\d\.]+)/);
	
	if(jscript){

		/*
		 *	IE浏览器版本获取思路
		 *	IE9-11， js引擎版本号与浏览器版本号相同
		 *	有document.documentMode，说明IE8以上
		 *	有XMLHttpRequest，说明IE7以上
		 *	有compatMode，说明IE6以上
		 */

		userAgent2result(/MSIE\s\d+/);

		//IE版本，msie为文档模式，version为浏览器版本
		result.rv = jscript > 8 ? jscript : compatMode ? "XMLHttpRequest" in win ? documentMode ? 8 : 7 : 6 : 5;

		//result.msie直接采用document.documentMode，IE6\7浏览器按高版IE的documentMode规则计算
		result.msie = documentMode || (compatMode === "CSS1Compat" ? result.rv : 5);
		nav[lang] = nav.userLanguage;

	} else if(documentMode){
		result.msie = documentMode;
		result.rv = rv || documentMode;
	} else {

		if(typeof netscape === "object"){
			userAgent2result(/Gecko\/\d+/);
			result.Gecko = rv || true;
		} else if(typeof opera === "object"){
			userAgent2result(/Opera/);
			result.Opera = opera.version();
			nav[lang] = nav[lang].replace(/\-\w+$/, function(str){
				return str.toUpperCase();
			});
		} else {
			userAgent2result(regWebkit);

			setrv("WebKit", true);
			setrv("Chrome", win.chrome);
			setrv("Maxthon", /^Maxthon/.test(nav.vendor));
			setrv("Safari", /^Apple/.test(nav.vendor), "Version");
			setrv("Opera", /^Opera/.test(nav.vendor), "OPR");
			
		}
	}

	result[lang] = nav[lang];

	return result;
}));
