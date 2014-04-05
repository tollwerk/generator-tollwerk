#XHTML 5
config.xhtml_cleaning                     = all
config.doctype                            = html5
 
#CHARSET
config.metaCharset                        = utf-8
config.renderCharset                      = utf-8
 
#URLS<% if(sbaseurl && baseurl) { %>
[globalString = ENV:HTTP_HOST=<%= sbaseurl.split('://').pop().split('/').shift() %>]
  config.baseURL                          = <%= sbaseurl %>
[ELSE]
  config.baseURL                          = {$baseURL}
[GLOBAL]<% } else if (sbaseurl) { %>
config.baseURL                          	= <%= sbaseurl %><% } else if (baseurl) { %>
config.baseURL                          	= {$baseURL}<% } %>
config.simulateStaticDocuments						= 0
config.tx_realurl_enable                  = 0
config.tx_cooluri_enable                  = 0
config.redirectOldLinksToNew              = 0
config.jumpurl_enable                     = 0

#SUCHE EINSCHALTEN
config.index_enable                       = 1
 
#EMAIL SPAMPROTECTION
config.spamProtectEmailAddresses          = 1
config.spamProtectEmailAddresses_atSubst  = (at)

#COMMON PAGE CONFIGURATION
page.config.admPanel                      = 0
config {
  intTarget                               = _self
	compressJs                              = {$compressJs}
	compressCss                             = {$compressCss}
	concatenateJsAndCss                     = {$concatenateJsAndCss}
}