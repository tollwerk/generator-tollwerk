# CLEAN UP CONTENT RENDERING
config.disableImgBorderAttr             = 1
lib.stdheader.stdWrap.dataWrap          = |
lib.stdheader.stdWrap.dataWrap.override = |
lib.stdheader.stdWrap.prefixComment     >

tt_content {
  stdWrap {
    innerWrap.cObject.default           >
    dataWrap                            >
    prefixComment                       >
    prepend.dataWrap                    >
  }
  header.20 {
    dataWrap                            >
    prefixComment                       >
  }
  html.prefixComment                    >
  default.prefixComment                 >
  text {
    stdWrap.prefixComment               >
    20.prefixComment                    >
  }
  textpic.20.stdWrap.prefixComment      >
  table.20.stdWrap.prefixComment        >
  mailform.20.stdWrap.wrap              >
  menu.20.stdWrap.prefixComment         >
  image.20.stdWrap.prefixComment        >
  list.20.stdWrap.prefixComment         >
  stdWrap.prepend.dataWrap              >
}

#DELETE DEFAULT ATTRIBUTES (z.B. class="bodytext")
lib.parseFunc_RTE.nonTypoTagStdWrap.encapsLines.addAttributes >