// handle lists (blacklist and whitelist) as well as init from central web server


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.message == "incrementBadgeCounter")
      incrementBadgeCounter({color:[240, 0, 0, 125]});
  });


var myAdBlockCounter=0;
function incrementBadgeCounter(color){
    myAdBlockCounter+=1;
    if (chrome.browserAction){
         if (color) {
            chrome.browserAction.setBadgeBackgroundColor(color);
        } else {
            chrome.browserAction.setBadgeBackgroundColor({color:[200, 0, 0, 255]});
        }
        chrome.browserAction.setBadgeText({text:myAdBlockCounter.toString()});
    } else {
        chrome.runtime.sendMessage({message: "incrementBadgeCounter"});
    }
}

/*base_adRegEx=[
                /adman\./ ,
                /^googleads/ ,
                /^pagead/ ,
                /adserver/ ,
                /^ad\./ ,
                /^adsite\./ ,
                /adservices/ ,
                /pagead\/js/,
                /steepto/ ,
                /sparrowpics/ ,
                /\/ads\//,
                /doubleclick/ ,
             //   /ytimg/ , //test
                /adzerk/ ,
                /googlesyndication/,
                /www\.facebook\.com\/plugins\//,
                /\.mgid\./,
                /wwwpromoter/
            ];

*/

JDBstr = '[  \
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "adman\." },   \
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "^googleads" }, \
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "^pagead" }, \
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "adserver" }, \
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "^ad\." }, \
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "^adsite\." }, \
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "adservices" }, \
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "pagead\/js" }, \
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "steepto" }, \
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "sparrowpics" }, \
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "\/ads\/" }, \
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "doubleclick" }, \
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "adzerk" }, \
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "googlesyndication" }, \
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "www\.facebook\.com\/plugins\/" }, \
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "\.mgid\." }, \
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "wwwpromotr" } ] ';

JDBWhiteStr = '[ \
                ]'

gJDBobj = null ;
gJDBWLobj = null;


function JDBobj(){
    if (gJDBobj == null) {
        var JDB=fromJson(JDBstr);
        console.log(JDB);        
        for ( i=0 ; i< JDB.length ; i++ ) {
            var J = JDB[i];
            JDB[i].location_rx= new RegExp(J.location_rx);
            JDB[i].node_rx= new RegExp(J.node_rx);
            JDB[i].link_rx= new RegExp(J.link_rx);
        }
        gJDBobj=JDB;  
        console.log(gJDBobj);      
    }
    return gJDBobj ;
}

function JDBWLobj(){
    if (gJDBWLobj == null) {
        var JDB=fromJson(JDBWhiteStr);
        console.log(JDB);        
        for ( i=0 ; i< JDB.length ; i++ ) {
            var J = JDB[i];
            JDB[i]= new RegExp(J);
        }
        gJDBWLobj=JDB;  
        console.log(gJDBWLobj);   
    }
    return gJDBWLobj ;
}


function checkIt(request,b,c){
var u = request.url;
var w = window.location.href;
    for( var i=0; i<JDBWLobj().length; i++) {
        var rex =JDBWLobj()[i];
        if ( w.match(rex)) {
            console.log("skip check - in WhiteList : " + w);
        }
    }
    if(u) {
        //log("check:" + u);
        for( var i=0; i<JDBobj().length; i++) {
            var J =JDBobj()[i];
            var rex =J.link_rx;
            if ( u.match(rex)) {
                console.log("new checking - caught : " + u,rex);
                incrementBadgeCounter()
                return { cancel: true}
            }
        }
    }
}


function scanNode(node,mode){
    var found=false;
    if (node) {
        if (!mode) mode="scan"
        var attribs=["href","src", "data"];
        for( var attr of attribs) {
            if (node.hasAttribute(attr)) {
                var url = new URL_class(node.getAttribute(attr))
                if (url && notBlank(url.host)) {
                    for( var i=0; i<JDBobj().length; i++) {
                        var J =JDBobj()[i];
                        var rex =J.link_rx;
                        if (url.host.match(rex)) {
                            console.log("new myAdBlock " + mode + " :" + url.host, rex)
                           // if (mode=="LIVE") { alert("got you")}
                            node.setAttribute("hidden_"+attr, url.str()) ; //"javascript:void(0)")
                            node.setAttribute(attr, "about:blank") ; //"javascript:void(0)")
                            node.style.display ="none";
                            incrementBadgeCounter()
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
