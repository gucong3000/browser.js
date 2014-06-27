module.exports = function( grunt ) {
	"use strict";

	function readOptionalJSON( filepath ) {
		var data = {};
		try {
			data = grunt.file.readJSON( filepath );
		} catch ( e ) {}
		return data;
	}

	// The concatenated file won't pass onevar
	// But our modules can

	grunt.initConfig({
		pkg: grunt.file.readJSON( "package.json" ),

		jshint: {
			all: {
				src: "browser.js",
				options: {
					jshintrc: true
				}
			}
		},

		uglify: {
			options: {
				banner: "/* <%= pkg.name %> v<%= pkg.version %>\n * homepage: <%= pkg.homepage %>\n */\n",
				preserveComments: function(o, info){
					return /@(cc_on|if|else|end|_jscript(_\w+)?)\s/i.test(info.value);
				},
				report: "min",
				footer: "",
				compress: {
					hoist_funs: false,
					loops: false,
					unused: false
				}
			},
			all: {
				files: {
					"browser.min.js": [ "browser.js" ]
				}
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-jshint");
	//文件合并插件
	grunt.loadNpmTasks("grunt-contrib-uglify");

	// Default grunt
	grunt.registerTask( "default", [ "jshint", "uglify" ] );
};
