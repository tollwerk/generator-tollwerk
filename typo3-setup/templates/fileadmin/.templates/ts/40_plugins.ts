# TYPO3 CMS 6.2+ syntax: Include all TypoScript resources inside the `plugins` subdirectory (recursive)
<INCLUDE TYPOSCRIPT: source="DIR:./plugins" extensions="ts">

# For TYPO3 CMS versions < 6.2 you will need to include single files instead of the whole directory
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/.templates/ts/plugins/10_plugin_foo.ts">
# <INCLUDE_TYPOSCRIPT: source="FILE:fileadmin/.templates/ts/plugins/20_plugin_bar.ts">
# ...