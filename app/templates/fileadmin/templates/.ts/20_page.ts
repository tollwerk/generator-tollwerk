# TYPO3 CMS 6.2+ syntax: Include all TypoScript resources inside the `lang` subdirectory (recursive)
<INCLUDE TYPOSCRIPT: source="DIR:./page" extensions="ts">

# For TYPO3 CMS versions < 6.2 you will need to include single files instead of the whole directory
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/templates/.ts/page/10_page_config.ts">
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/templates/.ts/page/20_page_rendering.ts">
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/templates/.ts/page/30_page_head.ts">
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/templates/.ts/page/99_page_type.ts">
# ...