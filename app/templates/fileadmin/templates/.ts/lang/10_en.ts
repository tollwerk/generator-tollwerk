#ENGLISH (DEFAULT)
config {
	linkVars										= L
	uniqueLinkVars							= 1
	sys_language_mode						= strict
	sys_language_overlay				= hideNonTranslated
	
	htmlTag_langKey							= en
	sys_language_uid						= 0
	language										= en
	locale_all									= en_EN
}
page.meta {
	keywords.field							= keywords
	keywords.ifEmpty ( 
		keyword1, keyword2, keywordn+1 
	)
	description.field						= description
	description.ifEmpty ( 
		English description 
	)
}