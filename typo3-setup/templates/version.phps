#! /usr/bin/env php
<?php

$EM_CONF = array();
$_EXTKEY = 'core';
$version = '';

if (($argc > 1) && strlen($argv[1]) && @is_file($argv[1])) {
	include $argv[1];
}

if (is_array($EM_CONF[$_EXTKEY]) && array_key_exists('version', $EM_CONF[$_EXTKEY])) {
	$version = $EM_CONF[$_EXTKEY]['version'];
}

die($version);
