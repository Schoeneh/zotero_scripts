# Zotero-S'n'R - Search and Replace for Zotero
Zotero was and still is in dire need of a simple search and replace function. Consequently, I decided to learn JavaScript and coded a basic solution.  
## What it does:
1. First, provide the `$field` that should be searched ([full list of available fields and their names](https://api.zotero.org/itemFields?pprint=1)).
2. Next, you need to provide the `$search-string` and `$replace-string` (2 further prompts).
3. Then the script will start a search in your current library (`$field contains $search-string`); just as the normal 'Advanced Search' would do.
5. After that, you will see how many items will be updated and a preview. Once you confirm, the script will perform the operation and tell you how many items were changed.

## What you should do:
**Back up your local Zotero-library before using my script (or doing any batch-editing)!**
- [Guide by University of Ottawa Library](https://uottawa.libguides.com/how_to_use_zotero/back_up_and_restore)
- [Official Documentation](https://www.zotero.org/support/zotero_data)


## How to use it -- 1: "Run JavaScript"
The easiest way of running Zotero-S'n'R is to copy the code from '[src/basic_script.js](https://github.com/Schoeneh/zotero-s-n-r/releases/latest/download/basic_script.js)' into Tools --> Developer --> Run Javascript:

![Screenshot showing the menu and submenus: Tools, Developer, Run JavaScript](doc/screenshot_developer.png)
