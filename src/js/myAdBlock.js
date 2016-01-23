
var myAdBlockCounter=0;
function actionLog(action,badHost){
    myAdBlockCounter+=1;
    //chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 230]});
    if (chrome.browserAction) chrome.browserAction.setBadgeText({text:myAdBlockCounter.toString()});

}

var URL_class=function (url) {
    var s
    var t
    if (url){
        s = url.match(/(^https?:\/\/)/)
        if (s) this.protocol = s[0];
        s = url.match(/^https?:\/\/(.*?)\//)
        if (s) {
            s = s[1]
            this.host = s.toLowerCase();
            t = s.match(/(^.*?@)/)
            if (t) {
                this.credentials = t[1]
                t = this.host
                t = t.match(/.*@(.*)/)
                if (t) this.host = t[1]
            }
            s = this.host
            t = s.match(/(.+?)(:\d+)/)
            if (t)
                if (t[2]) {
                    this.host = t[1]
                    this.port = t[2]
                }
            s = url.match(/^https?:\/\/.*?(\/.*)$/)
            if (s) this.therest = s[1]
        }
    }
}

URL_class.prototype.str = function() {
    var s = ""
            // protocol/credentials/host/port/therest
    if (this.protocol) s = s + this.protocol
    if (this.credentials) s = s + this.credentials
    if (this.host) s = s + this.host
    if (this.port) s = s + this.port;
    if (this.therest) s = s + this.therest
    return s;
}

URL_class.prototype.redirect = function(newhost, newport) {
    if (newhost) this.host = newhost
    if (newport) this.port = newport
    return this;
}

base_adRegEx=[
                /adman\./ ,
                /^googleads/ ,
                /^pagead/ ,
                /^adserver/ ,
                /^ad\./ ,
                /adservices/ ,
                /steepto/ ,
                /sparrowpics/ ,
                /doubleclick/ ,
             //   /ytimg/ , //test
                /adzerk/ ,
                /googlesyndication/,
                /\.mgid\./,
                /wwwpromoter/
            ];

function scanNode(node,mode){
    var found=false;
    if (node) {
        if (!mode) mode="scan"
        var attribs=["href","src"];
        for( var attr of attribs) {
            if (node.hasAttribute(attr)) {
                var url = new URL_class(node.getAttribute(attr))
                if (url && notBlank(url.host)) {
                    for( var rex of base_adRegEx){
                        if (url.host.match(rex)) {
                            console.log("myAdBlock " + mode + " :" + url.host)
                           // if (mode=="LIVE") { alert("got you")}
                            node.setAttribute(attr, "javascript:void(0)")
                            node.style.display ="none";
                            actionLog()
                            found=true;
                            continue;
                        }
                    }
                }
            }
        }
    };
    return found;
}


var ADBLOCK_ENGINE=function(){
    this.base_adRegEx=base_adRegEx;
};

ADBLOCK_ENGINE.prototype.scan=function(topNode) {
    //alert("loaded as xpi : " +  isLoadedAsXPI())
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
        timeOut=1000;
    else
        timeOut+=1000;
    if (myAdBlock.scan()){ timeOut=1000}
    setTimeout(pageFullyLoaded, timeOut)
}

function checkIt(request,b,c){
var u = request.url;
    if(u) {
  //  log("check:" + u);
    for( var rex of base_adRegEx){
        if ( u.match(rex)) {
            console.log("stopping request to : " + u);
            actionLog()
            return { cancel: true}
        }
    }
    }
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

function menuHandlerAB(e,t){
    var  menuID=e.menuItemId;
    var sel=e.selectionText;
    if (!sel) sel="";
    var tabID= "";
    if (t) tabID=t.id;
    console.log(var_dump(e),var_dump(t));
}

//
// https://developer.chrome.com/extensions/contextMenus
//

function createMenuItemsAB(){
var contexts = ["page","selection","link","editable","image","video",
                "audio"];
var parent = chrome.contextMenus.create({"id" : "TellMe", "title" : "Tell me", "contexts":contexts, "onclick" : menuHandlerAB});
}

if (chrome.contextMenus) createMenuItemsAB();


