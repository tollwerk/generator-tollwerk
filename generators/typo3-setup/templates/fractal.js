'use strict';

const path = require('path');
const fractal = module.exports = require('@frctl/fractal').create();
const typo3 = require('fractal-typo3');
const tenon = require('fractal-tenon');
const ComponentCollection = require('@frctl/fractal/src/api/components/collection');
const ComponentSource = require('@frctl/fractal/src/api/components/source');
const Component = require('@frctl/fractal/src/api/components/component');

// Create a custom theme and pass it to the configuration
const typo3Theme = require('@frctl/mandelbrot')({ 'nav': ['docs', 'components'] });
typo3.configure('public', '<%= url %>', typo3Theme);

fractal.set('project.title', '<%= title %>');
fractal.components.set('label', 'Patterns');
fractal.components.set('path', path.join(__dirname, 'fractal', 'components'));

/**
 * Render an component source overview
 *
 * @param {ComponentSource} componentSource Component source
 * @param {Array} options Options
 * @return {string} Component source overview (HTML)
 */
function renderComponents(componentSource, options) {
    let ret = '';
    let sub = '';
    // Run though all components of this component source
    for (let component of componentSource) {
        // Descend into subcollections
        if (component instanceof ComponentCollection) {
            sub = renderComponents(component.items(), options);
            if (sub.length) {
                ret += '<li><strong>' + component.label + '</strong>' + sub + '</li>';
            }
        } else if (!component.isHidden) {
            if (component.variants && (component.variants().size > 1)) {
                sub = renderComponents(component.variants(), options);
                ret += '<li><strong>' + component.label + '</strong>' + sub + '</li>';
            } else {
                ret += '<li>' + options.fn(Object.assign(component.toJSON(), { status: component.status })) + '</li>';
            }
        }
    }
    return ret.length ? ('<ul>' + ret + '</ul>') : '';
}

// Configure the documentation
const hbs = require('@frctl/handlebars')({
    helpers: {
        componentList: function () {
            return renderComponents(fractal.components, Array.from(arguments).pop());
        }
    }
});
fractal.docs.engine(hbs);
fractal.docs.set('path', path.join(__dirname, 'fractal', 'docs'));

fractal.web.set('static.path', path.join(__dirname, 'public'));
fractal.web.set('builder.dest', path.join(__dirname, 'fractal', 'build'));

fractal.components.engine(typo3.engine);
fractal.components.set('ext', '.t3s');
fractal.cli.command('update-typo3 [typo3path]', typo3.update, {
    description: 'Update the components by extracting them from a TYPO3 instance (defaults to "public")'
});

fractal.components.set('statuses', Object.assign({
    tbd: {
        label: 'TBD',
        description: 'Planned but not yet started. Go ahead! :)',
        color: '#CCCCCC'
    }
}, fractal.components.get('statuses')));

// Create a custom theme
tenon(typo3Theme, {
    apiKey: '<replace_with_tenon_api_key>',
    publicUrl: '<https://your.public.fractal.url>'
});

fractal.web.theme(typo3Theme);