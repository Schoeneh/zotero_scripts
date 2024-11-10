# Search and Replace for Zotero
Enhanced batch-editing with some safeguards and quality-of-life-improvements 
## Features
- **Interface** via JS-prompt, -confirm and -alert
  - no modifying of code necessary; no cryptic messages/errors in `Run Javascript`-console  
    <img src="https://github.com/user-attachments/assets/61cabc98-9aa4-4c3c-9113-ce5337ee8a77" height="140em">

- **Safeguards**
  - Editing of items only after preview and manual confirmation (one time)  
    <img src="https://github.com/user-attachments/assets/6398fc76-a5ed-4aa3-93d0-0c9eae17a08c" height="140em">
  - Unique tag for each run; including inputs and date/time  
    <img src="https://github.com/user-attachments/assets/453987d6-4c02-47fa-868e-59892eacb806" height="20em">

- **Undo** (=!= backup)
  - Utilizing the unique tag & the search-scope 'all selected items'
    1. Select all items with the unique tag of the run to undo
    2. Set scope to 'all selected item'
    3. Get field, search-string and replace-string from the unique tag and simply reverse
    4. Profit

## What you should do:
**Back up your local Zotero-library before using my script (or doing any batch-editing)!**
- [Guide by University of Ottawa Library](https://uottawa.libguides.com/how_to_use_zotero/back_up_and_restore)
- [Official Documentation](https://www.zotero.org/support/zotero_data)


## How to use: `Run JavaScript`
Simply copy-paste the content of [search_replace.js](https://github.com/Schoeneh/zotero_scripts/blob/main/search%26replace/search_replace.js) into `'Tools' -> 'Developer' -> 'Run JavaScript'`  
<img src="https://github.com/user-attachments/assets/dfe680c2-470e-43bd-9311-8ae149125612" height="260em">
