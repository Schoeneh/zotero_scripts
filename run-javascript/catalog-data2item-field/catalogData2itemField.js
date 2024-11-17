// API = https://wiki.k10plus.de/display/K10PLUS/SRU
// https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query=NUM%3D978-3-8353-0636-3&recordSchema=MARC21-xml

const config = {"rvk_kobv":[{
    "apiPrefix":"https://sru.kobv.de/k2?version=1.1&operation=searchRetrieve&query=dc.identifier%3D",
    "apiSuffix":"&startRecord=1&maximumRecords=10&recordSchema=marcxml&recordPacking=xml&stylesheet=",
    "namespace1":"http://www.loc.gov/zing/srw/",
    "namespace2":"http://www.loc.gov/MARC21/slim",
    "eval1":"//zs:records/zs:record/zs:recordData",
    "eval2":"//datafield[@tag='084' and subfield[@code='2'] = 'rvk']/subfield[@code='a']"}
]};

const scope = prompt("Edit selected items oder search for items to edit? (selected/search)", "selected");
if (scope.includes("sel")){const selection = true}
else if (scope.includes("sea")){const search = true}
else {alert("<Error>: \""+scope+"\" is not a valid input.")}

var parser = new DOMParser();
const date = new Date(Date.now());

const operation = prompt(("Which operation to perform?\n" + list_operations(pathAPIs)), Object.keys(pathAPIs)[0])
try {
    apiPrefix = Object.values(pathAPIs)[operation];
    apiSuffix = Object.values(pathAPIs)[operation];
    namespace1() = Object.values(pathAPIs)[operation];
    namespace2 = Object.values(pathAPIs)[operation];
    eval1 = Object.values(pathAPIs)[operation];
    eval2 = Object.values(pathAPIs)[operation];

} catch {alert("<Error>: \""+operation+"\" is not a valid operation.")}

try {
    if (selection){
        var items = Zotero.getActiveZoteroPane().getSelectedItems();


    }
    else if (search){alert("<Error> Not yet implemented. Sorry!")}
} catch(err) {alert("<Error>\n"+err+"\nscope: "+scope+"\nfieldName: "+fieldName+"\n"+"search: "+search+"\nreplace: "+replace+"\n\nFeel free to open an issue at https://github.com/Schoeneh/zotero_scripts/issues and include this error-message.")}


var collection_error = new Zotero.Collection();
collection_error.name = "ISBN2RVK_Error_" + date.toISOString()

var collection_success = new Zotero.Collection();
collection_success.name = "ISBN2RVK_" + date.toISOString()

for (let item of items) {
    var txt = "";
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
        let test = xmlDoc.evaluate("//zs:records/zs:record/zs:recordData",xmlDoc,namespace1,XPathResult.ANY_TYPE,null);
    
        let node = null;
        var RVK = [];
        while ((node = test.iterateNext())) {
            var xmlDoc2 = parser.parseFromString(node["innerHTML"],"text/html");
            var test2 = xmlDoc2.evaluate("//datafield[@tag='084' and subfield[@code='2'] = 'rvk']/subfield[@code='a']",xmlDoc2,namespace2,XPathResult.ANY_TYPE,null);
        
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
    for (key in Object.keys(pathAPIs)){
        return Object.keys(pathAPIs)[key]+"\n"
    }

}

function namespace1() {
  return "http://www.loc.gov/zing/srw/";
}
function namespace2() {
    return "http://www.loc.gov/MARC21/slim"
}