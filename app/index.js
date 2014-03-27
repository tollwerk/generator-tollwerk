'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');


var TollwerkGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = require('../package.json');

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
    });
  },

  askFor: function () {
    var done = this.async();

    // have Yeoman greet the user
    this.log(this.yeoman);

    // replace it with a short and sweet description of your generator
    this.log(chalk.magenta('You\'re using the fantastic tollwerk project kickstarter.'));

    var prompts = [{
      type: 'confirm',
      name: 'typo3',
      message: 'Is this going to be a TYPO3 project?',
      default: true
    },{
      type: 'confirm',
      name: 'sass',
      message: 'Are you going to use Sass?',
      default: true
    },{
      type: 'list',
      name: 'templating',
      message: 'Which templating system are you going to use?',
      choices: [{name: 'FluidTYPO3', value: 'ft3'}, {name: 'TemplaVoila!', value: 'tv'}, {name: 'None', value: 'none'}],
      default: 'ft3'
    }];

    this.prompt(prompts, function (props) {
      this.typo3			= props.typo3;
      this.sass				= props.sass;
      this.templating		= props.templating;

      done();
    }.bind(this));
  },

  app: function () {
  	
  	// If this is a TYPO3 project
  	if (this.typo3) {
  		this.copy('README.md', 'README.md');

  		// Create the fileadmin directory structure
  		this.directory('fileadmin', 'fileadmin');
    	
    	// Create Sass directory (if needed)
    	if (this.sass) {
    		this.directory('options/sass/fileadmin', 'fileadmin');
    	}
    	
    	switch (this.templating) {
    		
    		// TemplaVoila!
    		case 'tv':
    			this.directory('options/tv/fileadmin', 'fileadmin');
    			break;
    	}
  	}

    this.copy('_package.json', 'package.json');
    this.copy('_bower.json', 'bower.json');
  },

  projectfiles: function () {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
  }
});

module.exports = TollwerkGenerator;