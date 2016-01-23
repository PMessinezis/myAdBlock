
var myAdBlockCounter=0;
function actionLog(action,badHost){
    myAdBlockCounter+=1;
    //chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 230]});
    if (chrome.browserAction) chrome.browserAction.setBadgeText({text:myAdBlockCounter.toString()});

}

function isArray(a){
    var aType= varType(a);
    return (aType  === '[object Array]' );
}

function isObject(o){
    return (typeof (o)==="object");
}

function isBlank(o){return isEmpty(o);}
function notBlank(o){return ! isBlank(o);}
function notEmpty(o){return ! isEmpty(o);}

function isObj(o){
    var t=typeof(o);
    var e=true;
    var v=o;
    t=t.toLowerCase();
    if (t=="string") {
        e=false
    } else if ((t=="number") || (t=="function")) {
        e=false;
    } else if (t=="object")  {
        e=true;
    } else if ((v===null) || (v===undefined) ){
        e=false;
    } else if (! isEmpty(v.length) ){
        e=true;
    } else {
        var c=0;
        for (var x in v){c+=1;}
        e=(c==0);
    }
    return e;
}

function isEmpty(o){
    var t=typeof(o);
    var e=true;
    var v=o;
    t=t.toLowerCase();
    if (t=="string") v=o.trim();
    if ((t=="number") || (t=="function")) {
        e=false;
    } else if ((v===null) || (v===undefined) ){
        e=true;
    } else if (! isEmpty(v.length) ){
        e=v.length==0;
    } else {
        var c=0;
        for (var x in v){c+=1;}
        e=(c==0);
    }
    return e;
}


var URL_class=function (url) {

    var s
    var t
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
                /wwwpromoter/
            ];

var ADBLOCK_ENGINE=function(){

this.base_adRegEx=base_adRegEx;

};

function scanNode(node,mode){
    if (!node) {
        node=this;
        mode="LIVE"
    };
    if (!mode) mode="scan"
    if (node.hasAttribute("href")) {
        var href = new URL_class(node.attributes["href"])
        if (href && notBlank(href.host)) {
            for( var rex of base_adRegEx){
                if (href.host.match(rex)) {
                    console.log("myAdBlock " + mode + " :" + href.host)
                   // if (mode=="LIVE") { alert("got you")}
                    node.attributes["href"] = "javascript:void(0)"
                    node.style.display ="none";
                    actionLog()
                    return true
                }
            }
        }
    }
    if (node.hasAttribute("src")){
        var src = new URL_class(node.attributes["src"])
        if (src && notBlank(src.host)) {
            for( var rex of base_adRegEx){
                if (src.host.match(rex)) {
                    console.log("myAdBlock " + mode + " :" + src.host)
                   // if (mode=="LIVE") { alert("got you")}
                    node.attributes["src"] = "javascript:void(0)"
                    node.style.display ="none";
                    actionLog()
                    return true
                }
            }
        }
    }
}


function scanLiveNode(){
     var node=this;
     console.log("livequery callback" + var_dump(this))
     scanNode(node);;
}

ADBLOCK_ENGINE.prototype.scan=function(topNode) {
    //alert("loaded as xpi : " +  isLoadedAsXPI())
    var myloc = new URL_class(document.URL)
    if (!topNode) topNode=document;
    var all = topNode.getElementsByTagName("*");
    for (var i = 0, max = all.length; i < max; i++) {
        scanNode(all[i]);
    }
}


var myAdBlock=new ADBLOCK_ENGINE;

function theDomHasLoaded(){
    console.log("DOM loaded");
    myAdBlock.scan()
}

function pageFullyLoaded(){
    console.log("DOM REALLY loaded");
    myAdBlock.scan()
    setTimeout(pageFullyLoaded, 1500)
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

var callback = function(details) {return checkIt(details)};
var filter = {urls: ["<all_urls>"]};
var opt_extraInfoSpec = ["blocking"];

console.log("Adding listeners " + location.host)

if (chrome.webRequest) {
     console.log("Adding webrequest listener " + location.host)
     chrome.webRequest.onBeforeRequest.addListener(callback, filter, opt_extraInfoSpec);
} else {
    console.log("Adding element creation and document loaded listeners " + location.host)
    theDomHasLoaded();
    window.addEventListener("load", pageFullyLoaded, false);

    var observer = new WebKitMutationObserver( function(mutations) {
        mutations.forEach( function(mutation) {
            for (var i = 0; i < mutation.addedNodes.length; i++) {
                if (mutation.addedNodes[i].hasAttribute){
                    if (mutation.addedNodes[i].hasAttribute("href") ||  mutation.addedNodes[i].hasAttribute("src")) {
                        scanNode(mutation.addedNodes[i],"LIVE")
                    }
                };
            }
            if (mutation.type="attribute") {
                if (mutation.attributeName=="href" || mutation.attributeName=="src")  {
                    if ( (mutation.target[mutation.attributeName]!="javascript:void") && (mutation.target[mutation.attributeName].match(base_adRegEx))) {
                        console.log("live blocking attribute: " ,mutation.target[mutation.attributeName])
                        mutation.target[mutation.attributeName]="javascript:void"
                        actionLog()
                    }
                }
            };
        })
    });
//    observer.observe(document, { subtree: true, characterData: true, childList: true, attributes: true });
      observer.observe(document, { subtree: true, childList: true, attributes: true });
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


