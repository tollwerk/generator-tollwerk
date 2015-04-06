/* global module:false */
module.exports = function(grunt) {
	var fs						= require('fs');
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		<% if(sass) { %>
		sass					: {
			options				: {
				sourceMap		: true
			},
			above				: {
				files			: [{
					expand		: true,
					cwd			: 'fileadmin/<%= _.slugify(project) %>/.templates/sass/above',
		 			src			: ['**/*.scss'],
					dest		: 'fileadmin/<%= _.slugify(project) %>/.templates/css/above',
					ext			: '.css'
				}],
				options: {
					sourcemap	: true,
					style		: 'nested'
				}
			},
			below				: {
				files			: [{
					expand		: true,
					cwd			: 'fileadmin/<%= _.slugify(project) %>/.templates/sass/below',
		 			src			: ['**/*.scss'],
					dest		: 'fileadmin/<%= _.slugify(project) %>/.templates/css/below',
					ext			: '.css'
				}],
				options: {
					sourcemap	: true,
					style		: 'nested'
				}
			},
			noconcat			: {
				files			: [{
					expand		: true,
					cwd			: 'fileadmin/<%= _.slugify(project) %>/.templates/sass/noconcat',
		 			src			: ['**/*.scss'],
					dest		: 'fileadmin/<%= _.slugify(project) %>/.templates/css/noconcat',
					ext			: '.css'
				}],
				options: {
					sourcemap	: true,
					style		: 'nested'
				}
			}
		},
		<% } if(iconizr) { %>
		iconizr : {
			dist : {
				src : ['fileadmin/<%= _.slugify(project) %>/.templates/icons'],
				dest : ['fileadmin/<%= _.slugify(project) %>/css'],
				options : {<% if(sass) { %>
					render		: {
						css		: false,
						scss	: '../.templates/sass/noconcat/icon'
					},<% } else { %>
					render		: {
						css		: 'icon'
					},<% } %>
					spritedir	: 'icons',
					prefix		: 'icon',
					common		: 'icon',
					verbose		: 0,
					keep		: 0,
					dims		: 1,
					quantize	: 1,
					preview		: 'icons/preview'
				}
			}
		},
		<% } if(favicon) { %>
		favicons				: {
			options				: {
				html			: 'fileadmin/<%= _.slugify(project) %>/favicons/favicons.html',
				HTMLPrefix		: '/fileadmin/<%= _.slugify(project) %>/favicons/',
				precomposed		: false,
				firefox			: true,
				firefoxManifest : 'fileadmin/<%= _.slugify(project) %>/favicons/<%= _.slugify(project) %>.webapp',
				appleTouchBackgroundColor : '#222222'
			},
			icons				: {
				src				: 'fileadmin/<%= _.slugify(project) %>/.templates/favicon/favicon.png',
				dest			: 'fileadmin/<%= _.slugify(project) %>/favicons'
		    }
		},
		<% } %>
		
		copy					: {
			<% if(favicon) { %>
			favicon: {
				src				: 'fileadmin/<%= _.slugify(project) %>/favicons/favicon.ico',
				dest			: 'favicon.ico'
			}
			<% } %>
		},
		
		replace					: {
			<% if(favicon) { %>
			favicon: {
				src				: ['fileadmin/<%= _.slugify(project) %>/favicons/favicons.html'],
				overwrite		: true,
				replacements	: [{
					from		: /[\t\r\n]+/g,
					to			: ''
			    }, {
					from		: /<link rel="shortcut icon".*/g,
					to			: '<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon"/><link rel="icon" href="/favicon.ico" type="image/x-icon"/>'
			    }]
			}
			<% } %>
		},
		
		autoprefixer			: {
			options				: {
				browsers		: ['last 3 versions', 'ie 8'],
				map				: true
			},
			general				: {
				src				: ['fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>.css']
			},
			above				: {
				src				: ['fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>-above.css']
			},
			below				: {
				src				: ['fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>-below.css']
			},
			noconcat			: {
				expand			: true,
      			flatten			: true,
				src				: 'fileadmin/<%= _.slugify(project) %>/.templates/css/noconcat/*.css',
				dest			: 'fileadmin/<%= _.slugify(project) %>/css/'
			}<% if(iconizr && !sass) { %>,
			iconizr				: {
				src				: ['fileadmin/<%= _.slugify(project) %>/css/icon-*.css', '!fileadmin/<%= _.slugify(project) %>/css/icon-*.min.css']
			}<% } %>
		},
		
		cssmin					: {
			general				: {
				files			: {
					'fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>.min.css' : ['fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>.css']
				}
			},
			above				: {
				files			: {
					'fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>-above.min.css' : ['fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>-above.css']
				}
			},
			below				: {
				files			: {
					'fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>-below.min.css' : ['fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>-below.css']
				}
			},
			noconcat			: {
				expand			: true,
				cwd				: 'fileadmin/<%= _.slugify(project) %>/css',
				src				: ['**/*.css', '!**/*.min.css', '!<%= _.slugify(project) %>.css', '!<%= _.slugify(project) %>-above.css', '!<%= _.slugify(project) %>-below.css'],
				dest			: 'fileadmin/<%= _.slugify(project) %>/css',
				rename          : function (dest, src) {
					var folder  = src.substring(0, src.lastIndexOf('/')),
					filename    = src.substring(src.lastIndexOf('/'), src.length);
					filename    = filename.substring(0, filename.lastIndexOf('.'));
					return dest + '/' + folder + filename + '.min.css';
				}
			}<% if(iconizr && !sass) { %>,
			iconizr				: {
				expand			: true,
				cwd				: 'fileadmin/<%= _.slugify(project) %>/css/',
				src				: ['icon-{svg,png}-{sprite,data}.css'],
				dest			: 'fileadmin/<%= _.slugify(project) %>/css/',
				ext				: '.min.css'
			}<% } %>
		},

		concat_sourcemap		: {
			options: {
	          sourceRoot		: '/'
	        },
			general 			: {
				src				: ['fileadmin/<%= _.slugify(project) %>/.templates/css/*.css'],
				dest			: 'fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>.css'
			},
			above				: {
				src				: ['fileadmin/<%= _.slugify(project) %>/.templates/css/above/*.css'],
				dest			: 'fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>-above.css'
			},
			below				: {
				src				: ['fileadmin/<%= _.slugify(project) %>/.templates/css/below/*.css'],
				dest			: 'fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>-below.css'
			},
			javascript			: {
				expand			: true,
				cwd				: 'fileadmin/<%= _.slugify(project) %>/.templates/js/',
				src				: ['**/*.js'],
				dest			: 'fileadmin/<%= _.slugify(project) %>/js',
				ext				: '.js',
				extDot			: 'last',
				rename          : function (dest, src) {
					return dest + '/' + ((src.indexOf('/') >= 0) ? (src.substring(0, src.indexOf('/'))  + '.js') : src);
				}
			}
		},

		uglify : {
			options: {
	          sourceMap			: true,
	          sourceMapIn		: function(input) {
	          	return fs.existsSync(input + '.map') ? (input + '.map') : null;
	          }
	        },
			javascript          : {
				expand          : true,
				cwd             : 'fileadmin/<%= _.slugify(project) %>/js/',
				src             : ['**/*.js', '!**/*.min.js'],
				dest            : 'fileadmin/<%= _.slugify(project) %>/js/',
				ext				: '.min.js',
				extDot			: 'last'
			}
		},

		clean					: {
			general				: ['fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>.css', 'fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>.min.css'],
			above				: ['fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>-above.css', 'fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>-above.min.css'],
			below				: ['fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>-below.css', 'fileadmin/<%= _.slugify(project) %>/css/<%= _.slugify(project) %>-below.min.css']<% if(favicon) { %>,
			favicon				: ['favicon.ico']<% } %>
		},

		watch : {
			<% if(sass) {%>// Watch Sass resource changes
			sassAbove : {
				files : ['fileadmin/<%= _.slugify(project) %>/.templates/sass/above/**/*.scss', 'fileadmin/<%= _.slugify(project) %>/.templates/sass/common/**/*.scss'],
				tasks : ['sass:above']
			},
			sassBelow : {
				files : ['fileadmin/<%= _.slugify(project) %>/.templates/sass/below/**/*.scss', 'fileadmin/<%= _.slugify(project) %>/.templates/sass/common/**/*.scss'],
				tasks : ['sass:below']
			},
			sassNoconcat : {
				files : ['fileadmin/<%= _.slugify(project) %>/.templates/sass/noconcat/**/*.scss', 'fileadmin/<%= _.slugify(project) %>/.templates/sass/common/**/*.scss'],
				tasks : ['sass:noconcat']
			},<% } %>
			
			// Watch changing CSS resources
			cssGeneral : {
				files : ['fileadmin/<%= _.slugify(project) %>/.templates/css/*.css'],
				tasks : ['clean:general', 'concat_sourcemap:general', 'autoprefixer:general', 'cssmin:general'],
				options : {
					spawn : true
				}
			},
			cssAbove : {
				files : ['fileadmin/<%= _.slugify(project) %>/.templates/css/above/*.css'],
				tasks : ['clean:above', 'concat_sourcemap:above', 'autoprefixer:above', 'cssmin:above'],
				options : {
					spawn : true
				}
			},
			cssBelow : {
				files : ['fileadmin/<%= _.slugify(project) %>/.templates/css/below/*.css'],
				tasks : ['clean:below', 'concat_sourcemap:below', 'autoprefixer:below', 'cssmin:below'],
				options : {
					spawn : true
				}
			},
			cssNoconcat : {
				files : ['fileadmin/<%= _.slugify(project) %>/.templates/css/noconcat/*.css'],
				tasks : ['autoprefixer:noconcat', 'cssmin:noconcat'],
				options : {
					spawn : true
				}
			},
			
			<% if(iconizr) {%>// Watch SVG icon changes
			iconizr : {
				files : ['fileadmin/<%= _.slugify(project) %>/.templates/icons/**/*.svg'],
				tasks : ['iconizr'<% if(!sass) { %>, 'autoprefixer:iconizr', 'cssmin:iconizr'<% } %>],
				options : {
					spawn : true
				}
			},<% } %>
			
			// Watch & uglify changing JavaScript resources
			javascript : {
				files : ['fileadmin/<%= _.slugify(project) %>/.templates/js/**/*.js'],
				tasks : ['concat_sourcemap:javascript', 'uglify'],
				options : {
					spawn : true
				}
			},
			
			grunt: {
				files: ['Gruntfile.js'],
			    options: {
			      reload: true
			    }
			}
		}
	});

	// Default task.
	grunt.registerTask('default', [<% if(iconizr) {%>'iconizr', <% } %>'sass', 'css', 'js']);
	grunt.registerTask('css', ['clean:general', 'clean:above', 'clean:below',
								'concat_sourcemap:general', 'concat_sourcemap:above', 'concat_sourcemap:below',
								'autoprefixer',
								'cssmin']);
	grunt.registerTask('js', ['concat_sourcemap:javascript', 'uglify']);<% if(iconizr) {%>
	grunt.registerTask('icons', ['iconizr']);<% } %><% if(favicon) { %>
	grunt.registerTask('favicon', ['clean:favicon', 'favicons', 'copy:favicon', 'replace:favicon']);
	<% } %>
};