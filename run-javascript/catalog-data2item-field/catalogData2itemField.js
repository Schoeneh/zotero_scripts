const config = configs();
var selection = false;
var search = false;
const scope = prompt("Edit selected items oder search for items to edit? (selected/search)", "selected");
if (scope.includes("sel")){selection = true}
else if (scope.includes("sea")){search = true}
else {alert("<Error>: \""+scope+"\" is not a valid input."); return}

var parser = new DOMParser();
const date = new Date(Date.now());

const operation = prompt(("Which operation to perform?\n" + list_operations(config)), String(Object.keys(config)[0]))
try {
    var apiPrefix = config[operation]['apiPrefix'];
    var apiSuffix = config[operation]['apiSuffix'];
    var eval1 = config[operation]['eval1'];
    var eval2 = config[operation]['eval2'];
} catch(err) {alert("<Error>: \""+operation+"\" is not a valid operation.\n\n"+err); return}

try {
    if (selection){
        var items = Zotero.getActiveZoteroPane().getSelectedItems();
        var queryItems = [];
        var invalidQueryItems = [];
        var noQueryItems = [];
        for (let item of items) {
            try {
                let query = item.getField('ISBN');
                query = query.replace(/-/g, "");
                query = query.trim();

                if (query.length <= 13) {queryItems.push(item)
                } else {invalidQueryItems.push(item)}
            } catch {noQueryItems.push(item)}
            }
            confirm("Selected "+String(queryItems.length + invalidQueryItems.length + noQueryItems.length)+" items:\n" + String(queryItems.length) + "x valid ISBN,\n" + String(invalidQueryItems.length) + "x invalid ISBN,\n" + String(noQueryItems.length) + "x no ISBN\n\nContinue?");
            if (!confirm) {return undefined}
        } else if (search){alert("<Error> Not yet implemented. Sorry!\nSee https://github.com/Schoeneh/zotero_scripts/issues/19")}
    } catch(err) {alert("<Error>\n"+err+"\n\n Please open an issue with this message at https://github.com/Schoeneh/zotero_scripts/issues")}

var invalidResponseItems = [];
var count = 0;
try {
    for (item of queryItems){
        let node1 = null;
        let node2 = null;
        var RVK = [];
        let query = item.getField('ISBN');
        try {var data = await Zotero.HTTP.request("GET", apiPrefix + query + apiSuffix);
            let xmlDoc = data.responseXML;
            let result1 = xmlDoc.evaluate(eval1,xmlDoc,nsResolver,XPathResult.ANY_TYPE,null);
            while ((node1 = result1.iterateNext())) {
                var xmlDoc2 = parser.parseFromString(node1["innerHTML"],"text/html");
                var result2 = xmlDoc2.evaluate(eval2,xmlDoc2,nsResolver,XPathResult.ANY_TYPE,null);
            
                while ((node2 = result2.iterateNext())) {RVK.push(node2["innerHTML"]);}
            }
            if (!RVK.length) {invalidResponseItems.push(item)
            } else {
                item.setField('archiveLocation', RVK[0]);
                item.addTag(operation + "_" + date.toISOString());
                await item.saveTx();
                count++;
            }
        } catch {alert("API didn't answer.")}
    }
    // Dealing with all invalid items
    //alert("Info:\nnoQueryItems = "+String(noQueryItems.length)+"\ninvalidQueryItems = "+String(invalidQueryItems.length)+"\ninvalidResponseItems = "+String(invalidResponseItems.length));
    if (!noQueryItems.length == false) {
        var coll_err_isbn_null = new Zotero.Collection();
        coll_err_isbn_null.name = operation + "_Err:ISBNnull_" + date.toISOString();
        await coll_err_isbn_null.saveTx();
        for (item of noQueryItems){
            item.addToCollection(coll_err_isbn_null.key);
            await item.saveTx()
        }
    }
    if (!invalidQueryItems.length == false) {
        var coll_err_isbn_invalid = new Zotero.Collection();
        coll_err_isbn_invalid.name = operation + "_Err:ISBNinvalid_" + date.toISOString();
        await coll_err_isbn_invalid.saveTx();
        for (item of noQueryItems){
            item.addToCollection(coll_err_isbn_invalid.key);
            await item.saveTx()
        }
    } 
    if (!invalidResponseItems.length == false) {
        var coll_err_resp_null = new Zotero.Collection();
        coll_err_resp_null.name = operation + "_Err:ResponseInvalid_" + date.toISOString();
        await coll_err_resp_null.saveTx();
    }

    confirm("Success!\nModified "+count+" items (see tag \'"+(operation + "_" + date.toISOString())+"\'\n\nFor (potential) errors and invalid responses see collections \'"+(operation + "_Err:ISBNinvalid")+"\' and \'"+(operation + "_Err:ResponseInvalid")+"\'.\n\n\nMade by Henrik Schönemann\nFeature-requests etc. welcome, see https://github.com/Schoeneh/zotero_scripts/issues?q=is%3Aopen%20is%3Aissue%20project%3Aschoeneh%2F9")

} catch (error) {alert("<Error>\n"+err+"\n\n Please open an issue with this message at https://github.com/Schoeneh/zotero_scripts/issues")}

function list_operations(pathAPIs) {
    for (key in Object.keys(pathAPIs)){return Object.keys(pathAPIs)[key]+"\n" }
}

function nsResolver(prefix) {
    //Easy to add more namespaces and their prefixes
    const ns = {
        zs:"http://www.loc.gov/zing/srw/",
        marc21xml:"http://www.loc.gov/MARC21/slim"
    }
    return ns[prefix] || null
}

function configs() {
    // Configuration for the specific APIs + operations; easy to add more; see https://github.com/Schoeneh/zotero_scripts/issues/20
    const config = {
        "rvk_kobv":{
            "apiPrefix":"https://sru.kobv.de/k2?version=1.1&operation=searchRetrieve&query=dc.identifier%3D",
            "apiSuffix":"&startRecord=1&maximumRecords=10&recordSchema=marcxml&recordPacking=xml&stylesheet=",
            "namespace1":"http://www.loc.gov/zing/srw/",
            "namespace2":"http://www.loc.gov/MARC21/slim",
            "eval1":"//zs:records/zs:record/zs:recordData",
            "eval2":"//datafield[@tag='084' and subfield[@code='2'] = 'rvk']/subfield[@code='a']"},
    };
    return config
}