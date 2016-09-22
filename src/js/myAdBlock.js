



var ADBLOCK_ENGINE=function(){
//    this.base_adRegEx=base_adRegEx;
};

ADBLOCK_ENGINE.prototype.scan=function(topNode) {
    var myloc = new URL_class(document.URL)
    if (!topNode) topNode=document;
    var all = topNode.getElementsByTagName("*");
    var found=false;
    for (var i = 0, max = all.length; i < max; i++) {
        if (scanNode(all[i],"SCAN")) found=true;
    }
    return found;
}

var myAdBlock=new ADBLOCK_ENGINE;

function theDomIsLoading(){
    console.log("DOM loading");
    myAdBlock.scan()
}

var timeOut;
function pageFullyLoaded(){
    //console.log("DOM REALLY loaded");
    if (!timeOut)
        timeOut=100;
    else
        timeOut+=100;
    if (myAdBlock.scan()){ timeOut=100}
    setTimeout(pageFullyLoaded, timeOut)
}



function checkMutation(mutation){
    //console.log ("checking mutation " + mutation.type);
    for (var i = 0; i < mutation.addedNodes.length; i++) {
        var newNode=mutation.addedNodes[i];
        //console.log(newNode.nodeName, newNode.tagName);
        if (newNode.nodeName=="IFRAME" ) { //|| newNode.nodeName=="SCRIPT") {
            myObserve(newNode);
        }
        if (newNode.hasAttribute){
            if (newNode.hasAttribute("href") ||  newNode.hasAttribute("src")) {
                scanNode(newNode,"LIVE-NODE")
            }
        };
    }
    if (mutation.type="attribute") {
        if (mutation.attributeName=="href" || mutation.attributeName=="src")  {
            scanNode(mutation.target,"LIVE-ATTRIB");
        }
    };
}

function checkMutations(mutations){
    mutations.forEach( checkMutation )
}

function myObserve(node){
    var observer = new WebKitMutationObserver( checkMutations );
    console.log("Observing " + node.toString());
    observer.observe(node, { subtree: true, childList: true, attributes: true });
}

console.log("Adding listeners " + location.host)

if (chrome.webRequest) {
    console.log("Adding webrequest listener " + location.host)
    var callback = function(details) {return checkIt(details)};
    var filter = {urls: ["<all_urls>"]};
    var opt_extraInfoSpec = ["blocking"];
    chrome.webRequest.onBeforeRequest.addListener(callback, filter, opt_extraInfoSpec);
} else {
    console.log("Adding element creation and document loaded listeners " + location.host)
    theDomIsLoading();
    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            console.log("event fired") ; pageFullyLoaded(); }
    };
    myObserve(document);
}

document.addEventListener('DOMContentLoaded', function () {
  myAdBlock.scan() } )

function menuHandlerAB(e,t){
    var  menuID=e.menuItemId;
    var sel=e.selectionText;
    if (!sel) sel="";
    var tabID= "";
    if (t) tabID=t.id;
    console.log(e,t,e.target);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {message: "getLastClicked"}, function(response) {
            console.log("received clicked node" , response);
        });  
    });
}

//
// https://developer.chrome.com/extensions/contextMenus
//

function createMenuItemsAB(){
var contexts = ["all"];
var parent = chrome.contextMenus.create({"id" : "myAdBlockMenu", "title" : "myAdBlock", "contexts":contexts, "onclick" : menuHandlerAB});
}

if (chrome.contextMenus) createMenuItemsAB();


