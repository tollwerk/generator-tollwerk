# TYPO3 CMS 6.2+ syntax: Include all TypoScript resources inside the `lang` subdirectory (recursive)
<INCLUDE TYPOSCRIPT: source="DIR:./lang" extensions="ts">

# For TYPO3 CMS versions < 6.2 you will need to include single files instead of the whole directory
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/.templates/ts/lang/10_en.ts">
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/.templates/ts/lang/20_de.ts">
# ...