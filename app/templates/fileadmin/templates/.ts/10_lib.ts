# TYPO3 CMS 6.2+ syntax: Include all TypoScript resources inside the `lib` subdirectory (recursive)
<INCLUDE TYPOSCRIPT: source="DIR:./lib" extensions="ts">

# For TYPO3 CMS versions < 6.2 you will need to include single files instead of the whole directory
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/templates/.ts/lib/10_header.ts">
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/templates/.ts/lib/20_fluid.ts">
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/templates/.ts/lib/30_footer.ts">
# ...