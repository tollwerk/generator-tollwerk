#GERMAN
[globalVar=GP:L=1]
	config{
		htmlTag_langKey						= de
		sys_language_uid					= 1	#INSERT YOUR LANGUAGE ID HERE
		language									= de
		locale_all								= de_DE
	}
	page.meta{
		keywords.field						= keywords
		keywords.ifEmpty ( 
			Schlüsselwort1, Schlüsselwort2, Schlüsselwortn+1 
		)
		description.field					= description
		description.ifEmpty ( 
			Deutsche Beschreibung
		)
	}
[global]