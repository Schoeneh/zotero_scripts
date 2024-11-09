var fieldName = prompt("Which field should be searched?\n\nFor a list of all available fields see:\nhttps://api.zotero.org/itemFields", "title");
var fieldID = Zotero.ItemFields.getID(fieldName);
var Tag = false;
if (fieldName.includes("tag")){fieldName = "tag", Tag = true}
else if (!fieldID) {alert("Error: \""+fieldName+"\" is not a valid field."); return undefinded}

var search = prompt("What characters/words should be searched for?", "Foo");
var replace = prompt("What should it be replaced with?", "Foobar");

const date = new Date(Date.now())
const uniqueTag = "SnR_"+date.toISOString()
// Search
try {
    var s = new Zotero.Search();
    s.libraryID = ZoteroPane.getSelectedLibraryID();
    
    if (fieldName.includes("date")){
        s.addCondition(fieldName, 'is', search);
    }
    else {
        s.addCondition(fieldName, 'contains', search);
    }

    var ids = await s.search();
    // Zotero search 'contains' is case insensitive - results need to be filtered again
    var idsCorrect = [];
    for (let id of ids) {
        var item = await Zotero.Items.getAsync(id);
        var fieldValue = item.getField(fieldName);
        if (fieldValue.includes(search)) {idsCorrect.push(id);}
    }
    if (Tag){idsCorrect = ids}

    // Preview of Edit
    if (!idsCorrect.length) {alert("No items found")}
    else {
        var previewItem = await Zotero.Items.getAsync(idsCorrect[0]);
        if (Tag) {
            let previewTags = previewItem.getTags();
            for (let element of previewTags){
                if (element.tag.includes(search)){var previewOldValue = element.tag}
            }
        }
        else {var previewOldValue = previewItem.getField(fieldName)}
        
        let previewNewValue = previewOldValue.replace(search, replace);
        var confirmed = confirm(idsCorrect.length + " item(s) found" + "\n\n" +
        "Old:\n" + previewOldValue + "\n" + "New:\n" + previewNewValue);
    }

    // Replace
    if (confirmed == true) {

            for (let id of idsCorrect) {
                let item = await Zotero.Items.getAsync(id);
                item.addTag(uniqueTag);
                if (Tag){
                    let itemTags = item.getTags();
                    for (let element of itemTags){
                        if (element.tag.includes(search)){
                            let oldValue = element.tag;
                            let newValue = oldValue.replace(search, replace);
                            item.addTag(newValue);
                            item.removeTag(oldValue);
                            await item.save()
                        }
                    }
                }
                else {
                    await Zotero.DB.executeTransaction(async function () {
                        let mappedFieldID = Zotero.ItemFields.getFieldIDFromTypeAndBase(item.itemTypeID, fieldName);
                        let oldValue = item.getField(fieldName);
                        let newValue = oldValue.replace(search, replace);
                        item.setField(mappedFieldID ? mappedFieldID : fieldID, newValue);
                        await item.save();
                })
            }
        };
        alert(idsCorrect.length + " item(s) updated.\n(See tag: "+uniqueTag+")");
    }
}
catch(err) {alert(err)}

/* fields without search operator 'contains' (according to https://github.com/zotero/zotero/blob/5152d2c7ffdfac17a2ffe0f3fc0e3a01a6e51991/chrome/content/zotero/xpcom/data/searchConditions.js#L659)
dateAdded, dateModified, datefield, 
*/