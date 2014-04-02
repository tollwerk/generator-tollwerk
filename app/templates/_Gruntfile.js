/* global module:false */
module.exports = function(grunt) {
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		<% if(sass) { %>
		sass					: {
			above				: {
				files			: [{
					expand		: true,
					cwd			: 'fileadmin/<%= _.slugify(name) %>/.templates/sass/above',
		 			src			: ['**/*.scss'],
					dest		: 'fileadmin/<%= _.slugify(name) %>/.templates/css/above',
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
					cwd			: 'fileadmin/<%= _.slugify(name) %>/.templates/sass/below',
		 			src			: ['**/*.scss'],
					dest		: 'fileadmin/<%= _.slugify(name) %>/.templates/css/below',
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
					cwd			: 'fileadmin/<%= _.slugify(name) %>/.templates/sass/noconcat',
		 			src			: ['**/*.scss'],
					dest		: 'fileadmin/<%= _.slugify(name) %>/.templates/css/noconcat',
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
				src : ['fileadmin/<%= _.slugify(name) %>/.templates/icons'],
				dest : ['fileadmin/<%= _.slugify(name) %>/css'],
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
				html			: 'fileadmin/<%= _.slugify(name) %>/favicons/favicons.html',
				HTMLPrefix		: '/fileadmin/<%= _.slugify(name) %>/favicons/',
				precomposed		: false,
				firefox			: true,
				firefoxManifest : 'fileadmin/<%= _.slugify(name) %>/favicons/<%= _.slugify(name) %>.webapp',
				appleTouchBackgroundColor : '#222222'
			},
			icons				: {
				src				: 'fileadmin/<%= _.slugify(name) %>/.templates/favicon/favicon.png',
				dest			: 'fileadmin/<%= _.slugify(name) %>/favicons'
		    }
		},
		<% } %>
		
		copy					: {
			<% if(favicon) { %>
			favicon: {
				src				: 'fileadmin/<%= _.slugify(name) %>/favicons/favicon.ico',
				dest			: 'favicon.ico'
			}
			<% } %>
		},
		
		autoprefixer			: {
			options				: {
				browsers		: ['last 3 versions', 'ie 8']
			},
			general				: {
				src				: ['fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>.css']
			},
			above				: {
				src				: ['fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>-above.css']
			},
			below				: {
				src				: ['fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>-below.css']
			},
			noconcat			: {
				expand			: true,
      			flatten			: true,
				src				: 'fileadmin/<%= _.slugify(name) %>/.templates/css/noconcat/*.css',
				dest			: 'fileadmin/<%= _.slugify(name) %>/css/'
			}<% if(iconizr && !sass) { %>,
			iconizr				: {
				src				: ['fileadmin/<%= _.slugify(name) %>/css/icons-*.css', '!fileadmin/<%= _.slugify(name) %>/css/icons-*.min.css']
			}<% } %>
		},
		
		cssmin					: {
			general				: {
				files			: {
					'fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>.min.css' : ['fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>.css']
				}
			},
			above				: {
				files			: {
					'fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>-above.min.css' : ['fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>-above.css']
				}
			},
			below				: {
				files			: {
					'fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>-below.min.css' : ['fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>-below.css']
				}
			},
			noconcat			: {
				expand			: true,
				cwd				: 'fileadmin/<%= _.slugify(name) %>/css/',
				src				: ['*.css', '!*.min.css', '!<%= _.slugify(name) %>.css', '!<%= _.slugify(name) %>-above.css', '!<%= _.slugify(name) %>-below.css'],
				dest			: 'fileadmin/<%= _.slugify(name) %>/css/',
				ext				: '.min.css'
			}<% if(iconizr && !sass) { %>,
			iconizr				: {
				expand			: true,
				cwd				: 'fileadmin/<%= _.slugify(name) %>/css/',
				src				: ['icons-{svg,png}-{sprite,data}.css'],
				dest			: 'fileadmin/<%= _.slugify(name) %>/css/',
				ext				: '.min.css'
			}<% } %>
		},

		concat					: {
			general 			: {
				src				: ['fileadmin/<%= _.slugify(name) %>/.templates/css/*.css'],
				dest			: 'fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>.css'
			},
			above				: {
				src				: ['fileadmin/<%= _.slugify(name) %>/.templates/css/above/*.css'],
				dest			: 'fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>-above.css'
			},
			below				: {
				src				: ['fileadmin/<%= _.slugify(name) %>/.templates/css/below/*.css'],
				dest			: 'fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>-below.css'
			},
			javascript			: {
				src				: ['fileadmin/<%= _.slugify(name) %>/.templates/js/*.js'],
				dest			: 'fileadmin/<%= _.slugify(name) %>/js/<%= _.slugify(name) %>.js'
			}
		},

		uglify : {
			javascript			: {
				expand			: true,
				cwd				: 'fileadmin/<%= _.slugify(name) %>/js',
				src				: ['*.js', '!*.min.js'],
				dest			: 'fileadmin/<%= _.slugify(name) %>/js',
				ext				: '.min.js'
			}
		},

		clean					: {
			general				: ['fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>.css', 'fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>.min.css'],
			above				: ['fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>-above.css', 'fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>-above.min.css'],
			below				: ['fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>-below.css', 'fileadmin/<%= _.slugify(name) %>/css/<%= _.slugify(name) %>-below.min.css']<% if(favicon) { %>,
			favicon				: ['favicon.ico']<% } %>
		},

		watch : {
			<% if(sass) {%>// Watch Sass resource changes
			sassAbove : {
				files : 'fileadmin/<%= _.slugify(name) %>/.templates/sass/above/**/*.scss',
				tasks : ['sass:above']
			},
			sassBelow : {
				files : 'fileadmin/<%= _.slugify(name) %>/.templates/sass/below/**/*.scss',
				tasks : ['sass:below']
			},
			sassNoconcat : {
				files : 'fileadmin/<%= _.slugify(name) %>/.templates/sass/noconcat/**/*.scss',
				tasks : ['sass:noconcat']
			},<% } %>
			
			// Watch changing CSS resources
			cssGeneral : {
				files : ['fileadmin/<%= _.slugify(name) %>/.templates/css/*.css'],
				tasks : ['clean:general', 'concat:general', 'autoprefixer:general', 'cssmin:general'],
				options : {
					spawn : true
				}
			},
			cssAbove : {
				files : ['fileadmin/<%= _.slugify(name) %>/.templates/css/above/*.css'],
				tasks : ['clean:above', 'concat:above', 'autoprefixer:above', 'cssmin:above'],
				options : {
					spawn : true
				}
			},
			cssBelow : {
				files : ['fileadmin/<%= _.slugify(name) %>/.templates/css/below/*.css'],
				tasks : ['clean:below', 'concat:below', 'autoprefixer:below', 'cssmin:below'],
				options : {
					spawn : true
				}
			},
			cssNoconcat : {
				files : ['fileadmin/<%= _.slugify(name) %>/.templates/css/noconcat/*.css'],
				tasks : ['autoprefixer:noconcat', 'cssmin:noconcat'],
				options : {
					spawn : true
				}
			},
			
			<% if(iconizr) {%>// Watch SVG icon changes
			iconizr : {
				files : ['fileadmin/<%= _.slugify(name) %>/.templates/icons/**/*.svg'],
				tasks : ['iconizr'<% if(!sass) { %>, 'autoprefixer:iconizr', 'cssmin:iconizr'<% } %>],
				options : {
					spawn : true
				}
			},<% } %>
			
			// Watch & uglify changing JavaScript resources
			javascript : {
				files : ['fileadmin/<%= _.slugify(name) %>/js/*.js', '!fileadmin/<%= _.slugify(name) %>/js/*.min.js'],
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
	grunt.registerTask('favicon', ['clean:favicon', 'favicons', 'copy:favicon']);
	<% } %>
};
