# TYPO3 CMS 6.2+ syntax: Include all TypoScript resources inside the `lib` subdirectory (recursive)
<INCLUDE_TYPOSCRIPT: source="DIR:./lib" extensions="ts">

# For TYPO3 CMS versions < 6.2 you will need to include single files instead of the whole directory
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/.templates/ts/lib/10_header.ts">
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/.templates/ts/lib/20_fluid.ts">
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/.templates/ts/lib/30_footer.ts">
# ...

# TYPO3 CMS 6.2+ syntax: Include all TypoScript resources inside the `lang` subdirectory (recursive)
<INCLUDE_TYPOSCRIPT: source="DIR:./page" extensions="ts">

# For TYPO3 CMS versions < 6.2 you will need to include single files instead of the whole directory
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/.templates/ts/page/10_page_config.ts">
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/.templates/ts/page/20_page_rendering.ts">
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/.templates/ts/page/30_page_head.ts">
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/.templates/ts/page/99_page_type.ts">
# ...

# TYPO3 CMS 6.2+ syntax: Include all TypoScript resources inside the `lang` subdirectory (recursive)
<INCLUDE_TYPOSCRIPT: source="DIR:./lang" extensions="ts">

# For TYPO3 CMS versions < 6.2 you will need to include single files instead of the whole directory
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/.templates/ts/lang/10_en.ts">
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/.templates/ts/lang/20_de.ts">
# ...

# TYPO3 CMS 6.2+ syntax: Include all TypoScript resources inside the `plugins` subdirectory (recursive)
<INCLUDE_TYPOSCRIPT: source="DIR:./plugins" extensions="ts">

# For TYPO3 CMS versions < 6.2 you will need to include single files instead of the whole directory
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/.templates/ts/plugins/10_plugin_foo.ts">
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/.templates/ts/plugins/20_plugin_bar.ts">
# ...