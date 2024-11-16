// API = https://wiki.k10plus.de/display/K10PLUS/SRU
// Using ISBN
// https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query=NUM%3D978-3-8353-0636-3&recordSchema=MARC21-xml
// https://sru.kobv.de/k2?version=1.1&operation=searchRetrieve&query=dc.identifier%3D978-3-8353-0636-3&startRecord=1&maximumRecords=10&recordSchema=marcxml&recordPacking=xml

// titleInfo

var items = Zotero.getActiveZoteroPane().getSelectedItems();
var parser = new DOMParser();
var apiCall = "https://sru.kobv.de/k2?version=1.1&operation=searchRetrieve&query=dc.identifier%3D";
var suffix = "&startRecord=1&maximumRecords=10&recordSchema=marcxml&recordPacking=xml&stylesheet=";

const date = new Date(Date.now())
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
        let test = xmlDoc.evaluate("//zs:records/zs:record/zs:recordData",xmlDoc,namespace,XPathResult.ANY_TYPE,null);
    
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

function namespace() {
  return "http://www.loc.gov/zing/srw/";
}
function namespace2() {
    return "http://www.loc.gov/MARC21/slim"
}