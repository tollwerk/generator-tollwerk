#FAVICON
page.headerData.600             = TEXT
page.headerData.600.value (
  <link rel="shortcut icon" href="{$baseURL}favicon.ico" type="image/x-icon" />
  <link rel="icon" href="{$baseURL}favicon.ico" type="image/x-icon" />
)

#TOUCHICONS (@see http://iconogen.com)
page.headerData.601                        = TEXT
page.headerData.601.value (
	<link rel="apple-touch-startup-image" href="startup.png" />
	<link rel="apple-touch-icon" href="apple-touch-icon-precomposed.png" />
	<link rel="apple-touch-icon" sizes="57x57" href="apple-touch-icon-57x57-precomposed.png" />
	<link rel="apple-touch-icon" sizes="72x72" href="apple-touch-icon-72x72-precomposed.png" />
	<link rel="apple-touch-icon" sizes="114x114" href="apple-touch-icon-114x114-precomposed.png" />
	<link rel="apple-touch-icon" sizes="144x144" href="apple-touch-icon-144x144-precomposed.png" />
	<link rel="apple-touch-icon" sizes="57x57" href="apple-touch-icon-60x60-precomposed.png" />
	<link rel="apple-touch-icon" sizes="72x72" href="apple-touch-icon-120x120-precomposed.png" />
	<link rel="apple-touch-icon" sizes="114x114" href="apple-touch-icon-76x76-precomposed.png" />
	<link rel="apple-touch-icon" sizes="144x144" href="apple-touch-icon-152x152-precomposed.png" />
)
 
#META
page.meta.author								= Page Author
page.meta.robots								= index,follow
 
#CSS
page.includeCSS {
#	fonts		  										= http://fonts.googleapis.com/css?family=Droid+Sans:400,700|Droid+Serif:400,700,400italic
#	fonts.external							  = 1
#  normalize									  	= fileadmin/templates/css/normalize.css
}
page.CSS_inlineStyle						>
config.inlineStyle2TempFile			= 1

# [browser = msie] && [version= <9]
#  page.includeCSS.ie8	 					= fileadmin/templates/css/ie8.css
# [global]

#JAVASCRIPT
page.includeJS {
	html5												 = http://html5shiv.googlecode.com/svn/trunk/html5.js
	html5.external               = 1
	html5.allWrap                = <!--[if lt IE 9]>|<![endif]-->
	html5{
		disableCompression				 = 1
		forceOnTop								 = 1
		excludeFromConcatenation	 = 1
	}		
}  
page.includeJSFooter {
  jquery                       = http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
  jquery {
    external                   = 1
    forceOnTop                 = 1
    disableCompression         = 1
    excludeFromConcatenation   = 1
  }
}
config.removeDefaultJS         = external
		
# GOOGLE ANALYTICS TRACKING CODE PLUGIN
# page.headerData.9999				 =< plugin.tx_twgoogleanalytics