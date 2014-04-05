/* global module:false */
module.exports = function(grunt) {
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		<% if(sass) { %>
		sass					: {
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
						scss	: '../.templates/sass/noconcat/icons'
					},<% } else { %>
					render		: {
						css		: 'icons'
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
					to			: '<link rel="shortcut icon" href="<%= baseurl %>favicon.ico" type="image/x-icon"/><link rel="icon" href="<%= baseurl %>favicon.ico" type="image/x-icon"/>'
			    }]
			}
			<% } %>
		},
		
		autoprefixer			: {
			options				: {
				browsers		: ['last 3 versions', 'ie 8']
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
				src				: ['fileadmin/<%= _.slugify(project) %>/css/icons-*.css', '!fileadmin/<%= _.slugify(project) %>/css/icons-*.min.css']
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
				cwd				: 'fileadmin/<%= _.slugify(project) %>/css/',
				src				: ['*.css', '!*.min.css', '!<%= _.slugify(project) %>.css', '!<%= _.slugify(project) %>-above.css', '!<%= _.slugify(project) %>-below.css'],
				dest			: 'fileadmin/<%= _.slugify(project) %>/css/',
				ext				: '.min.css'
			}<% if(iconizr && !sass) { %>,
			iconizr				: {
				expand			: true,
				cwd				: 'fileadmin/<%= _.slugify(project) %>/css/',
				src				: ['icons-{svg,png}-{sprite,data}.css'],
				dest			: 'fileadmin/<%= _.slugify(project) %>/css/',
				ext				: '.min.css'
			}<% } %>
		},

		concat					: {
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
				src				: ['fileadmin/<%= _.slugify(project) %>/.templates/js/*.js'],
				dest			: 'fileadmin/<%= _.slugify(project) %>/js/<%= _.slugify(project) %>.js'
			}
		},

		uglify : {
			javascript			: {
				expand			: true,
				cwd				: 'fileadmin/<%= _.slugify(project) %>/js',
				src				: ['*.js', '!*.min.js'],
				dest			: 'fileadmin/<%= _.slugify(project) %>/js',
				ext				: '.min.js'
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
				files : 'fileadmin/<%= _.slugify(project) %>/.templates/sass/above/**/*.scss',
				tasks : ['sass:above']
			},
			sassBelow : {
				files : 'fileadmin/<%= _.slugify(project) %>/.templates/sass/below/**/*.scss',
				tasks : ['sass:below']
			},
			sassNoconcat : {
				files : 'fileadmin/<%= _.slugify(project) %>/.templates/sass/noconcat/**/*.scss',
				tasks : ['sass:noconcat']
			},<% } %>
			
			// Watch changing CSS resources
			cssGeneral : {
				files : ['fileadmin/<%= _.slugify(project) %>/.templates/css/*.css'],
				tasks : ['clean:general', 'concat:general', 'autoprefixer:general', 'cssmin:general'],
				options : {
					spawn : true
				}
			},
			cssAbove : {
				files : ['fileadmin/<%= _.slugify(project) %>/.templates/css/above/*.css'],
				tasks : ['clean:above', 'concat:above', 'autoprefixer:above', 'cssmin:above'],
				options : {
					spawn : true
				}
			},
			cssBelow : {
				files : ['fileadmin/<%= _.slugify(project) %>/.templates/css/below/*.css'],
				tasks : ['clean:below', 'concat:below', 'autoprefixer:below', 'cssmin:below'],
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
				files : ['fileadmin/<%= _.slugify(project) %>/js/*.js', '!fileadmin/<%= _.slugify(project) %>/js/*.min.js'],
				tasks : ['uglify'],
				options : {
					spawn : true
				}
			}
		}
	});

	// Default task.
	grunt.registerTask('default', ['iconizr', 'sass', 'css', 'js']);
	grunt.registerTask('css', ['clean:general', 'clean:above', 'clean:below',
								'concat:general', 'concat:above', 'concat:below',
								'autoprefixer',
								'cssmin']);
	grunt.registerTask('js', ['uglify']);
	grunt.registerTask('icons', ['iconizr']);
	<% if(favicon) { %>
	grunt.registerTask('favicon', ['clean:favicon', 'favicons', 'copy:favicon', 'replace:favicon']);
	<% } %>
};
