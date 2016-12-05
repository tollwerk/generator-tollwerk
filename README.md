# generator-tollwerk [![Build Status](https://secure.travis-ci.org/jkphl/generator-tollwerk.png?branch=master)](https://travis-ci.org/jkphl/generator-tollwerk)

> The [Yeoman](http://yeoman.io) generator we use at [tollwerk](https://tollwerk.de) to kickstart [TYPO3](https://typo3.org) projects and setup our [Gulp](http://gulpjs.com/) based toolchain.

## Installation & usage

To globally install this generator from npm, run:

```
$ npm install -g generator-tollwerk
```

To use the generator and kickstart a TYPO3 project, change to the installation directory and run:

```
$ sudo -u <user> -g <group> yo tollwerk
```

Please replace `<user>` and `<group>` with your webserver user and group.

## TYPO3 projects

In the first step the generator will walk you through a couple of questions and ask you for some basic project details:

| Property | Description                   |
|:---------|:------------------------------|
| project  | Unique project key / namespace, alphanumeric characters only, lowercased, used as project resource directory |
| title    | Readable title of the project |
| author   | Project publisher |
| version  | TYPO3 version to install (will get pulled live from https://get.typo3.org) |

The generator will then download the specified TYPO3 sources, install them in [composer mode](https://wiki.typo3.org/Composer), prepare a `_cli_lowlevel` user and ask you to run the TYPO3 installation wizard through your browser before proceeding with the generator. It is assumed that you have your webserver setup in place at that point. Please be aware that in composer installations the `web` directory is the root of your TYPO3 site. Continue the generator when you finished the installation wizard.

| Property | Description                   |
|:---------|:------------------------------|
| t3x_*    | Please select the TYPO3 extensions you'd like to be installed out of the box (mainly [FluidTYPO3](https://fluidtypo3.org/) & some tollwerk extensions) |
| url      | Official project URL |
| git      | Git repository URL (repository will be initialized when given) |

The generator will then

* prepare a project specific directory structure,
* pre-configure TYPO3 to use the external TypoScript sources,
* use composer to install the selected TYPO3 extensions and
* run an `npm` to pull in the Gulp toolchain.

## Project structure (simplified)

```
|-- composer.json                            # Composer configuration
|-- gulpfile.js                              # Gulp file
|-- package.json                             # NPM configuration
|-- source                                   # External source files
|   `-- <project>                            # Project specific source files
|       |-- css                              # PostCSS resources
|       |-- favicon                          # Favicon / touch icon source image
|       |-- html                             # HTML Fluid templates
|       |-- icons                            # SVG icons for iconizr
|       |-- js                               # JavaScript resources
|       |-- lang                             # XLIFF localization resources
|       |-- tmpl                             # Miscellaneous templates
|       |   `-- 60_page_dynamic.t3s          # Cache busting TypoScript template
|       `-- ts                               # TypoScript resources
|           |-- 10_main.t3s                  # Main TypoScript template for inclusion
|           |-- TSconfig
|           |   |-- page.t3s                 # Page TSConfig for inclusion
|           |   `-- user.t3s                 # User TSConfig for incluion
|           |-- lang
|           |   |-- 10_en.t3s                # English language settings
|           |   `-- 20_de.t3s                # German language settings (etc.)
|           |-- lib
|           |   |-- 10_header.t3s            # Header libraries
|           |   |-- 20_fluid.t3s             # FLUIDTEMPLATE libraries
|           |   `-- 30_footer.t3s            # Footer libraries
|           |-- page
|           |   |-- 10_page_config.t3s       # Page configuration
|           |   |-- 20_page_templating.t3s   # Layouts, templates & variables
|           |   |-- 30_page_head.t3s         # <head> configuration
|           |   `-- 40_page_rendering.t3s    # Content rendering settings
|           `-- plugins
`-- web
    |-- .htaccess                            # Apache .htaccess
    |-- fileadmin
    |   `-- <project>
    |       |-- .source
    |       |   |-- html -> ../../../../source/<project>/html/
    |       |   |-- lang -> ../../../../source/<project>/lang/
    |       |   `-- ts -> ../../../../source/<project>/ts/
    |       |-- css                          # Processed CSS resources
    |       |   |-- fonts
    |       |   `-- img
    |       |-- icons                        # Optimized single SVG icons
    |       |-- img
    |       `-- js                           # Processed JavaScript resources
    |-- index.php
    |-- robots.txt                           # Restrictive robots.txt for dev purposes
    |-- typo3
    |-- typo3conf
    |-- typo3temp
    `-- uploads
```

## Changelog

Please refer to the [changelog](CHANGELOG.md) for a complete release history.


## Legal

Copyright © 2016 [tollwerk GmbH](https://tollwerk.de@) / [Joschi Kuphal](https://twitter.com/jkphl).

*generator-tollwerk* is licensed under the terms of the [MIT license](LICENSE).
