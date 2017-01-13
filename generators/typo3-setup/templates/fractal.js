'use strict';

const path = require('path');
const fractal = module.exports = require('@frctl/fractal').create();
const typo3 = require('fractal-typo3');

fractal.set('project.title', '<%= title %>');
fractal.components.set('path', path.join(__dirname, 'fractal', 'components'));
fractal.docs.set('path', path.join(__dirname, 'fractal', 'docs'));
fractal.web.set('static.path', path.join(__dirname, 'web'));
fractal.web.set('builder.dest', path.join(__dirname, 'fractal', 'build'));

typo3.configure('web');

fractal.components.engine(typo3.engine);
fractal.components.set('ext', '.t3s');
fractal.cli.command('update-typo3 [typo3path]', typo3.update, {
    description: 'Update the components by extracting them from a TYPO3 instance (defaults to "web")'
});
