-- TYPO3 CMS 7.6.x

INSERT INTO `pages` (`pid`, `tstamp`, `sorting`, `perms_userid`, `perms_groupid`, `perms_user`, `perms_group`, `perms_everybody`, `crdate`, `cruser_id`, `title`, `doktype`, `TSconfig`, `is_siteroot`, `urltype`, `shortcut`, `shortcut_mode`, `fe_group`, `media`, `SYS_LASTCHANGED`) VALUES
	(0, UNIX_TIMESTAMP(), 256, 2, 0, 31, 27, 0, UNIX_TIMESTAMP(), 2, 'Start', 1, '<INCLUDE_TYPOSCRIPT: source="FILE: fileadmin/<%= project %>/.source/ts/TSconfig/page.t3s">', 1, 1, 0, 0, '', '0', UNIX_TIMESTAMP());

INSERT INTO `sys_template` (`pid`, `tstamp`, `sorting`, `crdate`, `cruser_id`, `title`, `root`, `clear`, `include_static_file`, `constants`, `config`) VALUES
	(1, UNIX_TIMESTAMP(), 256, UNIX_TIMESTAMP(), 2, 'NEW SITE', 1, 3, 'EXT:css_styled_content/static/<% if(t3x_tw_googleanalytics) { %>,EXT:tw_googleanalytics/Configuration/TypoScript<% } %><% if(t3x_squeezr) { %>,EXT:squeezr/Configuration/TypoScript<% } %>', 'compressJs = 0\r\ncompressCss = 0\r\ncompressHTML = 0\r\concatenateJs = 0\r\nconcatenateCss = 0\r\nconcatenateJsAndCss = 0', '<INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/<%= project %>/.source/ts/10_main.t3s">');
