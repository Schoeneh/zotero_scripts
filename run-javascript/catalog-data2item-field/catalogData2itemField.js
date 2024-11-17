// API = https://wiki.k10plus.de/display/K10PLUS/SRU
// https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query=NUM%3D978-3-8353-0636-3&recordSchema=MARC21-xml

const config = {
    "rvk_kobv":{
        "apiPrefix":"https://sru.kobv.de/k2?version=1.1&operation=searchRetrieve&query=dc.identifier%3D",
        "apiSuffix":"&startRecord=1&maximumRecords=10&recordSchema=marcxml&recordPacking=xml&stylesheet=",
        "namespace1":"http://www.loc.gov/zing/srw/",
        "namespace2":"http://www.loc.gov/MARC21/slim",
        "eval1":"//zs:records/zs:record/zs:recordData",
        "eval2":"//datafield[@tag='084' and subfield[@code='2'] = 'rvk']/subfield[@code='a']"},
};
var selection = false;
var search = false;
const scope = prompt("Edit selected items oder search for items to edit? (selected/search)", "selected");
if (scope.includes("sel")){selection = true}
else if (scope.includes("sea")){search = true}
else {alert("<Error>: \""+scope+"\" is not a valid input.")}

var parser = new DOMParser();
const date = new Date(Date.now());

const operation = prompt(("Which operation to perform?\n" + list_operations(config)), String(Object.keys(config)[0]))
try {
    var apiPrefix = config[operation]['apiPrefix'];
    var apiSuffix = config[operation]['apiSuffix'];
    var eval1 = config[operation]['eval1'];
    var eval2 = config[operation]['eval2'];
} catch(err) {alert("<Error>: \""+operation+"\" is not a valid operation.\n\n"+err)}

// Getting ISBN (and dealing with null/invalid)
var coll_err_isbn_invalid = new Zotero.Collection();
coll_err_isbn_invalid.name = operation + "_Err:ISBNinvalid_" + date.toISOString();
var coll_err_isbn_null = new Zotero.Collection();
coll_err_isbn_null.name = operation + "_Err:ISBNnull_" + date.toISOString();
try {
    if (selection){
        var items = Zotero.getActiveZoteroPane().getSelectedItems();
        var queryItems = [];
        var invalidQueryItems = 0;
        var noQueryItems = 0;
        for (let item of items) {
            try {
                var query = item.getField('ISBN');
                query = query.replace(/-/g, "");
                query = query.trim();

                if (query.length <= 13) {queryItems.push(item)
                } else {invalidQueryItems++}
            } catch {noQueryItems++}
            }
            confirm("Selected "+String(queryItems.length + invalidQueryItems + noQueryItems)+" items:\n" + String(queryItems.length) + "x valid ISBN,\n" + String(invalidQueryItems) + "x invalid ISBN,\n" + String(noQueryItems) + "x no ISBN\n\nContinue?");
        } else if (search){alert("<Error> Not yet implemented. Sorry!\nSee https://github.com/Schoeneh/zotero_scripts/issues/19")}
    } catch(err) {alert("<Error>\n"+err+"\n\n Please open an issue at https://github.com/Schoeneh/zotero_scripts/issues!")}


for (let item of items) {
    //var txt = "";
    var query = item.getField('ISBN');
    if (!query){
        await collection_error.saveTx();
        
        item.addToCollection(collection_error.key);
        await item.saveTx();
    }
    else {
        await collection_success.saveTx();
        
        let data = await Zotero.HTTP.request("GET", apiCall + query + suffix);
        let xmlDoc = data.responseXML;
        let test = xmlDoc.evaluate("//zs:records/zs:record/zs:recordData",xmlDoc,namespace1(config, operation),XPathResult.ANY_TYPE,null);
    
        let node = null;
        var RVK = [];
        while ((node = test.iterateNext())) {
            var xmlDoc2 = parser.parseFromString(node["innerHTML"],"text/html");
            var test2 = xmlDoc2.evaluate("//datafield[@tag='084' and subfield[@code='2'] = 'rvk']/subfield[@code='a']",xmlDoc2,namespace2(config, operation),XPathResult.ANY_TYPE,null);
        
            while ((node2 = test2.iterateNext())) {
                RVK.push(node2["innerHTML"]);
            }
        }

        item.setField('archiveLocation', RVK[0]);
        item.addToCollection(collection_success.key);
        await item.saveTx();
        return RVK[0];
    }
}

function list_operations(pathAPIs) {
    for (key in Object.keys(pathAPIs)){return Object.keys(pathAPIs)[key]+"\n" }
}

function namespace1(config, operation) {
  return Object.values(config)[operation]['namespace1']
}
function namespace2(config, operation) {
    return Object.values(config)[operation]['namespace2']
}