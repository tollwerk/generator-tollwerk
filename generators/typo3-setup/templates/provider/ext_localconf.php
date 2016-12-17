<?php

if (!defined('TYPO3_MODE')) {
    die ('Access denied.');
}

<% if(typo3Extensions.fluidpages) { %>\FluidTYPO3\Flux\Core::registerProviderExtensionKey('Tollwerk.<%= typo3ProviderExtension.upperCamelCase %>', 'Page');
<% } %><% if(typo3Extensions.fluidcontent) { %>\FluidTYPO3\Flux\Core::registerProviderExtensionKey('Tollwerk.<%= typo3ProviderExtension.upperCamelCase %>', 'Content');
<% } %>
