typo3-skeleton
==============

ist ein Basis-Skelett für neue TYPO3-Projekte, das eine bestimmte Verzeichnis-Grundstruktur sowie grundlegende TypoScript-Dateien mitbringt, die für die meisten unserer TYPO3-Projekte relevant sind.

Die Inhalte dieses Repositories sollten auf die oberste des TYPO3-Projekts extrahiert werden und integrieren vollständig sich ins `fileadmin`-Unterverzeichnis. Die diversen README-Dateien sodann entfernt werden.


Inhalt
----------

*   [.sass](fileadmin/templates/.sass): Verzeichniss für Sass-Resourcen
*   [.templaVoila](fileadmin/templates/.templaVoila): Verzeichniss für TemplaVoila!-Resourcen
*   [.ts](fileadmin/templates/.ts): Verzeichniss für TypoScript-Resourcen
*   [css](fileadmin/templates/css): Verzeichniss für CSS-Resourcen inkl. Webfonts & CSS-Bilder
*   [html](fileadmin/templates/html): Verzeichniss für HTML-Resourcen (Extensions & TemplaVoila!-Templates)
*   [js](fileadmin/templates/js): Verzeichniss für JavaScript-Resourcen
*   [lang](fileadmin/templates/lang): Verzeichniss für Lokalisierungs-Resourcen
*   [res](fileadmin/templates/res): Verzeichniss für sonstige Resourcen

TypoScript
----------

Um die TypoScript-Dateien des typo3-skeleton-Pakets ins Projekt zu integrieren, sind folgende Schritte notwendig:

1.  Die folgenden Zeilen müssen ins TypoScript-Root-Template unter
    **Setup** aufgenommen werden:

        <INCLUDE_TYPOSCRIPT: source="FILE: fileadmin/templates/.ts/plugins.ts">
        <INCLUDE_TYPOSCRIPT: source="FILE: fileadmin/templates/.ts/lib.ts">
        <INCLUDE_TYPOSCRIPT: source="FILE: fileadmin/templates/.ts/page.ts">
    
2.  Die folgende Zeile muss ins **pageTSconfig** der Startseite aufgenommen werden (`Seiteneigenschaften > Ressourcen > TypoScript-Konfiguration`):
    
        <INCLUDE_TYPOSCRIPT: source="FILE: fileadmin/templates/.ts/TSconfig/page.ts">

3.  Die folgende Zeile muss ggf. ins **userTSconfig** von Benutzern aufgenommen werden, die gezielt beeinflusst werden sollen:
    
        <INCLUDE_TYPOSCRIPT: source="FILE: fileadmin/templates/.ts/TSconfig/user.ts">
        
4.  Die folgenden **Konstanten** werden benötigt und müssen manuell im TypoScript-Root-Template angelegt werden:

        baseURL = http://meine-basis-url.de/
        compressJs = 1
        compressCss = 1
        concatenateJsAndCss = 1
        
    Der abschließende Slash der **baseURL** ist wichtig und sollte übernommen werden. Die übrigen drei Konstanten steuern die Kompression / Konkatenierung von JavaScript- und CSS-Resourcen. 
    
    
Sicherheitsmaßnahmen
--------------------

Da verschiedene Resourcen (z.B. TypoScript- und Sass-Dateien, TemplaVoila!-Strukturen etc.) nicht über den Webserver aufrufbar sein sollen, nutzt das typo3-skeleton-Paket eine spezielle **Konvention zur Benennung von Dateien und Verzeichnissen**: Datei- und Verzeichnisnamen, die mit einem Punkt beginnen, werden über eine `mod_rewrite`-Regel generell für den HTTP-Abruf gesperrt. Hierzu ist in die `.htaccess`-Datei des Projekts folgendes einzutragen (möglichst dicht nach der Aktivierung des Rewrite-Engines): 

    ###########################################################################
    # Disabling all files or folders within fileadmin starting with a .
    ###########################################################################
    RewriteRule ^fileadmin/(.*/)?\. - [F]