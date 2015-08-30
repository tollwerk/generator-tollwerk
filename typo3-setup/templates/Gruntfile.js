/* global module:false */
module.exports = function(grunt) {
	var fs						= require('fs');<% if(imagemin) { %>
	var mozjpeg					= require('imagemin-mozjpeg');<% } %>
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
					cwd			: 'fileadmin/<%= projectname %>/.templates/sass/above',
		 			src			: ['**/*.scss'],
					dest		: 'fileadmin/<%= projectname %>/.templates/css/above',
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
					cwd			: 'fileadmin/<%= projectname %>/.templates/sass/below',
		 			src			: ['**/*.scss'],
					dest		: 'fileadmin/<%= projectname %>/.templates/css/below',
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
					cwd			: 'fileadmin/<%= projectname %>/.templates/sass/noconcat',
		 			src			: ['**/*.scss'],
					dest		: 'fileadmin/<%= projectname %>/.templates/css/noconcat',
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
				src : ['fileadmin/<%= projectname %>/.templates/icons'],
				dest : ['fileadmin/<%= projectname %>/css'],
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
				html			: 'fileadmin/<%= projectname %>/favicons/favicons.html',
				HTMLPrefix		: '/fileadmin/<%= projectname %>/favicons/',
				precomposed		: false,
				firefox			: true,
				firefoxManifest : 'fileadmin/<%= projectname %>/favicons/<%= projectname %>.webapp',
				appleTouchBackgroundColor : '#222222'
			},
			icons				: {
				src				: 'fileadmin/<%= projectname %>/.templates/favicon/favicon.png',
				dest			: 'fileadmin/<%= projectname %>/favicons'
		    }
		},
		<% } %>
		
		copy					: {
			<% if(favicon) { %>
			favicon: {
				src				: 'fileadmin/<%= projectname %>/favicons/favicon.ico',
				dest			: 'favicon.ico'
			}
			<% } %>
		},
		
		replace					: {
			<% if(favicon) { %>
			favicon: {
				src				: ['fileadmin/<%= projectname %>/favicons/favicons.html'],
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
				src				: ['fileadmin/<%= projectname %>/css/<%= projectname %>.css']
			},
			above				: {
				src				: ['fileadmin/<%= projectname %>/css/<%= projectname %>-above.css']
			},
			below				: {
				src				: ['fileadmin/<%= projectname %>/css/<%= projectname %>-below.css']
			},
			noconcat			: {
				expand			: true,
      			flatten			: true,
				src				: 'fileadmin/<%= projectname %>/.templates/css/noconcat/*.css',
				dest			: 'fileadmin/<%= projectname %>/css/'
			}<% if(iconizr && !sass) { %>,
			iconizr				: {
				src				: ['fileadmin/<%= projectname %>/css/icon-*.css', '!fileadmin/<%= projectname %>/css/icon-*.min.css']
			}<% } %>
		},
		
		cssmin					: {
			general				: {
				files			: {
					'fileadmin/<%= projectname %>/css/<%= projectname %>.min.css' : ['fileadmin/<%= projectname %>/css/<%= projectname %>.css']
				}
			},
			above				: {
				files			: {
					'fileadmin/<%= projectname %>/css/<%= projectname %>-above.min.css' : ['fileadmin/<%= projectname %>/css/<%= projectname %>-above.css']
				}
			},
			below				: {
				files			: {
					'fileadmin/<%= projectname %>/css/<%= projectname %>-below.min.css' : ['fileadmin/<%= projectname %>/css/<%= projectname %>-below.css']
				}
			},
			noconcat			: {
				expand			: true,
				cwd				: 'fileadmin/<%= projectname %>/css',
				src				: ['**/*.css', '!**/*.min.css', '!<%= projectname %>.css', '!<%= projectname %>-above.css', '!<%= projectname %>-below.css'],
				dest			: 'fileadmin/<%= projectname %>/css',
				rename          : function (dest, src) {
					var folder  = src.substring(0, src.lastIndexOf('/')),
					filename    = src.substring(src.lastIndexOf('/'), src.length);
					filename    = filename.substring(0, filename.lastIndexOf('.'));
					return dest + '/' + folder + filename + '.min.css';
				}
			}<% if(iconizr && !sass) { %>,
			iconizr				: {
				expand			: true,
				cwd				: 'fileadmin/<%= projectname %>/css/',
				src				: ['icon-{svg,png}-{sprite,data}.css'],
				dest			: 'fileadmin/<%= projectname %>/css/',
				ext				: '.min.css'
			}<% } %>
		},

		concat_sourcemap		: {
			options: {
	          sourceRoot		: '/'
	        },
			general 			: {
				src				: ['fileadmin/<%= projectname %>/.templates/css/*.css'],
				dest			: 'fileadmin/<%= projectname %>/css/<%= projectname %>.css'
			},
			above				: {
				src				: ['fileadmin/<%= projectname %>/.templates/css/above/*.css'],
				dest			: 'fileadmin/<%= projectname %>/css/<%= projectname %>-above.css'
			},
			below				: {
				src				: ['fileadmin/<%= projectname %>/.templates/css/below/*.css'],
				dest			: 'fileadmin/<%= projectname %>/css/<%= projectname %>-below.css'
			},
			javascript			: {
				expand			: true,
				cwd				: 'fileadmin/<%= projectname %>/.templates/js/',
				src				: ['**/*.js'],
				dest			: 'fileadmin/<%= projectname %>/js',
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
				cwd             : 'fileadmin/<%= projectname %>/js/',
				src             : ['**/*.js', '!**/*.min.js'],
				dest            : 'fileadmin/<%= projectname %>/js/',
				ext				: '.min.js',
				extDot			: 'last'
			}
		},
		<% if(imagemin) { %>
		imageminbackup : {
			images: {
				options: {
					optimizationLevel	: 3,
						progressive		: true,
						use				: [mozjpeg()],
						backup			: '.backup'
				},
				files: [{
					expand		: true,
					cwd			: 'fileadmin/',
					src			: ['**/*.{png,PNG,jpg,JPG,jpeg,JPEG,gif,GIF}'],
					dest		: 'fileadmin/'
				}, {
					expand		: true,
					cwd			: 'uploads/',
					src			: ['**/*.{png,PNG,jpg,JPG,jpeg,JPEG,gif,GIF}'],
					dest		: 'uploads/'
				}]
			}
		},
		<% } %>
		clean					: {
			general				: ['fileadmin/<%= projectname %>/css/<%= projectname %>.css', 'fileadmin/<%= projectname %>/css/<%= projectname %>.min.css'],
			above				: ['fileadmin/<%= projectname %>/css/<%= projectname %>-above.css', 'fileadmin/<%= projectname %>/css/<%= projectname %>-above.min.css'],
			below				: ['fileadmin/<%= projectname %>/css/<%= projectname %>-below.css', 'fileadmin/<%= projectname %>/css/<%= projectname %>-below.min.css']<% if(favicon) { %>,
			favicon				: ['favicon.ico']<% } %>
		},
		<% if(validation) { %>
		validation: {
			options: {
				reset					: grunt.option('reset') || false,
					path				: '.validation/validation-status.json',
					reportpath			: '.validation/validation-report.json',
					stoponerror			: false,
					remotePath			: '<%= validation %>',
					remoteFiles			: '.validation/validation-files.json',
					relaxerror			: ['Bad value X-UA-Compatible for attribute http-equiv on element meta.'],
					generateReport		: true,
					errorHTMLRootDir	: '.validation/errors'
			},
			files						: {
				src						: ['*']
			}
		},
		<% } %>
		watch : {
			<% if(sass) {%>// Watch Sass resource changes
			sassAbove : {
				files : ['fileadmin/<%= projectname %>/.templates/sass/above/**/*.scss', 'fileadmin/<%= projectname %>/.templates/sass/common/**/*.scss'],
				tasks : ['sass:above']
			},
			sassBelow : {
				files : ['fileadmin/<%= projectname %>/.templates/sass/below/**/*.scss', 'fileadmin/<%= projectname %>/.templates/sass/common/**/*.scss'],
				tasks : ['sass:below']
			},
			sassNoconcat : {
				files : ['fileadmin/<%= projectname %>/.templates/sass/noconcat/**/*.scss', 'fileadmin/<%= projectname %>/.templates/sass/common/**/*.scss'],
				tasks : ['sass:noconcat']
			},<% } %>
			
			// Watch changing CSS resources
			cssGeneral : {
				files : ['fileadmin/<%= projectname %>/.templates/css/*.css'],
				tasks : ['clean:general', 'concat_sourcemap:general', 'autoprefixer:general', 'cssmin:general'],
				options : {
					spawn : true
				}
			},
			cssAbove : {
				files : ['fileadmin/<%= projectname %>/.templates/css/above/*.css'],
				tasks : ['clean:above', 'concat_sourcemap:above', 'autoprefixer:above', 'cssmin:above'],
				options : {
					spawn : true
				}
			},
			cssBelow : {
				files : ['fileadmin/<%= projectname %>/.templates/css/below/*.css'],
				tasks : ['clean:below', 'concat_sourcemap:below', 'autoprefixer:below', 'cssmin:below'],
				options : {
					spawn : true
				}
			},
			cssNoconcat : {
				files : ['fileadmin/<%= projectname %>/.templates/css/noconcat/*.css'],
				tasks : ['autoprefixer:noconcat', 'cssmin:noconcat'],
				options : {
					spawn : true
				}
			},
			
			<% if(iconizr) {%>// Watch SVG icon changes
			iconizr : {
				files : ['fileadmin/<%= projectname %>/.templates/icons/**/*.svg'],
				tasks : ['iconizr'<% if(!sass) { %>, 'autoprefixer:iconizr', 'cssmin:iconizr'<% } %>],
				options : {
					spawn : true
				}
			},<% } %>
			
			// Watch & uglify changing JavaScript resources
			javascript : {
				files : ['fileadmin/<%= projectname %>/.templates/js/**/*.js'],
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