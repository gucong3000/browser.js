/* browser.js v0.3
 * https://github.com/gucong3000/browser.js
 */
/*
 * define.amd存在时自动注册为其匿名模块
 * 无define但是有$时注册为其成员$.browser
 * 无define也无$时注册为全局变量
 * DEMO:
	function tester(exp, name){
		var info = browser(exp);
		if(info){
			document.writeln((name || exp) + "\t" + info + "<br>");
		}
	}
	
	tester("msie", "IE 文档模式");
	tester("version", "IE 版本号");
	tester("Gecko");
	if(browser("Opera && Chrome")){
		tester("Opera", "新版 Opera (Chrome内核)");
	} else if(browser("Opera && Presto")){
		tester("Opera", "老版 Opera (Presto内核)");
		tester("Presto");
	}
	tester("Webkit");
	tester("Safari");
	tester("Chrome");
	tester("Sogou", "搜狗高速模式");
	tester("Liebao", "猎豹高速模式");
	tester("Maxthon", "遨游高速模式");
	tester("TheWorld", "世界之窗高速模式");
	tester("TaoBrowser", "淘宝浏览器极速模式");
	tester("Coolnovo", "枫树浏览器高速模式");
	console.log(browser());
 */
"use strict";
(function (root, factory) {
	if (typeof define === 'function' && ( define.amd || define.cmd )) {
		// AMD. CMD. Register as an anonymous module.
		define(factory);
	} else {
		// Browser globals
		(root.$ || root).browser = factory();
	}
}(this, function () {
	var jscript /*@cc_on = @_jscript_version @*/,
		win = window,
		nav = win.navigator,
		doc = win.document,
		documentMode = doc.documentMode,
		lang = "language",
		result = {},
		expression;


	if( documentMode > 10 || jscript) {
		//IE11不支持条件编译，所以采用documentMode > 10来判断
		(function(){
			expression = function(exp){
				return exp.replace(/\b(?!(true|false))[\w\.]+\b/ig, function(name){
					return result[name.toLowerCase()] || "undefined";
				});
			};

			//IE版本，msie为文档模式，version为浏览器版本
			var compatMode = doc.compatMode;

			result.version = documentMode ? (jscript > 8 ? jscript : ( jscript ? 8 : documentMode)) : (compatMode ? "XMLHttpRequest" in win ? 7 : 6 : 5);
			result.msie = documentMode || (compatMode === "CSS1Compat" ? result.version : 5);

		})();
	} else {
		(function(){
			var ext = win.external || {},
				ua = nav.userAgent;

			expression = function(exp){
				return exp.replace(/\b(?!(true|false))[a-z]+\b/ig, function(name){
					return result[name.toLowerCase()];
				}).replace(/\b([\d\.]+)\s*([>=<]+)\s*([\d\.]+)\b/ig,function(exp){
					return compare(RegExp.$1, RegExp.$3) + RegExp.$2 + "0";
				}).replace(/\d+(\.\d+)+/g, function(ver){
					return '"' + ver + '"';
				});
			};

			//比较两个版本号，v1>v2则返回值大于零 v1<v2则返回值大于0，若v1==v2则返回值等于0
			function compare(v1, v2) {
				v1 = convert(v1);
				v2 = convert(v2);
				for (var diff = 0, i = 0; (i < v1.length || i < v2.length) && diff === 0; i++) {
					diff = parseNum(v1[i]) - parseNum(v2[i]);
				}
				return diff;
			}
		
			//将版本号按小数点分割为数组
			function convert(ver){
				return ver.toString().split(".");
			}
		
			//将字符串转为数字
			function parseNum(num){
				return parseInt(num) || 0;
			}
			
			//在字符串中查找版本号信息
			function getver(name, split) {
				if(new RegExp("\\b" + name + (split || "/") + "([\\d.]+)\\b").test(ua)){
					return RegExp.$1;
				}
			}
			
			//为result添加getter
			function defineGetter(name, fn, split){
				result.__defineGetter__(name.toLowerCase(), typeof fn === "function" ? function(){
					return fn() || getver(name, split) || true;
				} : function(){
					return getver(fn || name, split) || true;
				});
			}

			if ( win.opera && typeof opera.version == "function") {
				//老版本Opera(<=12)，>=13以后采用Chrome内核
				defineGetter("opera", opera.version);
				defineGetter("Presto");
				//修复浏览器差异，navigator.language从“zh-cn”形式改为“zh-CN”形式
				nav.language = nav.language.replace(/\b-\w+$/,function(country){
					return country.toUpperCase();
				});
			} else if ( win.netscape ) {
				defineGetter("gecko", "rv", ":");
			} else {
				ua = nav.appVersion;
				defineGetter("webkit", "\\w*WebKit");
		
				if( win.chrome ){
					//判定为Chrome
					defineGetter("Chrome");
				} else if ( /^Apple/.test(nav.vendor) ){
					//判定为Safari
					defineGetter("safari", "Version");
				}

				if(ext.SEVersion) {
					//搜狗浏览器
					defineGetter("sogou", ext.SEVersion);
				} else if ("max_version" in ext) {
					//傲游
					//Maxthon3使用max_version， Maxthon4使用appVersion
					result.maxthon = ext.max_version || getver("Maxthon");
				} else if (ext.LiebaoGetVersion) {
					//猎豹
					defineGetter("liebao", ext.LiebaoGetVersion);
				} else if ("coolnovo" in ext) {
					//枫树浏览器
					defineGetter("CoolNovo");
				} else if (/\bTheWorld\b/.test(ua)) {
					//世界之窗
					defineGetter("TheWorld");
				} else if (/\bTaoBrowser\b/.test(ua)) {
					//淘宝浏览器
					defineGetter("TaoBrowser");
				} else if (/\bOPR\b/.test(ua)) {
					//Opera浏览器(13.0及以上)
					defineGetter("opera", "OPR");
				}
				//QQ浏览器,360急速,360安全3款浏览器无探测方法
			}
		})();
	}

	result[lang] = nav[lang] || nav.userLanguage;

	return function(exp){
		return exp ? ((exp = exp.toLowerCase()) in result ? result[exp] :( result[exp] = new Function("return " + expression(exp))())) : result;
	};
}));
