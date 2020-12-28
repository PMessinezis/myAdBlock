// handle lists (blacklist and whitelist) as well as init from central web server


var LastClicked = null;

$('*').mousedown( function(e) {
        if (e.which == 3 ) { LastClicked=htmlnode(e.target);
            console_log("Node right-clicked" , LastClicked); 
        }
    });

/*
$(function() {
    $('*').on('contextmenu', function(e) {
        LastClicked=htmlnode(e.target);
        console_log("Menu Clicked" , LastClicked);
    });
});

*/

function getNodeDetails(aNode){
    var l=[]
    var p=null
    if (aNode) {
        var d = null
        p=aNode.parentNode;
        d={id : aNode.id, nodeName : aNode.nodeName, 
           nodeType : aNode.nodeType , className : aNode.className }
        var attributes = []
        if (aNode.attributes) {
            for (var i = 0; i < aNode.attributes.length; i++) {
            var attr={
            name : aNode.attributes[i].name,
            value : aNode.attributes[i].value }
            attributes.push(attr);
            }
        }
        d.attributes = attributes;
        l.push(d);
    }
    var pl = p ? getNodeDetails(p) : [] ;
    return l.concat(pl);
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console_log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension", var_dump(request));
    if (request.message == "incrementBadgeCounter") {
      incrementBadgeCounter({color:[240, 0, 0, 125]}); 
    } else if (request.message == "getLastClicked") {
        console_log("Checking" , LastClicked);
        var details=getNodeDetails(LastClicked);
        console_log(details);
        sendResponse({result: details});
    } else if (request.message == "LastClicked") {
        console_log(var_dump(LastClicked));
        console_log(var_dump(request.node));
    }
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
               { "location_rx" : ".+", "node_rx" : ".+", "link_rx" : "ads3-adnow.com\." }, \
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
        console_log(JDB);        
        for ( i=0 ; i< JDB.length ; i++ ) {
            var J = JDB[i];
            JDB[i].location_rx= new RegExp(J.location_rx);
            JDB[i].node_rx= new RegExp(J.node_rx);
            JDB[i].link_rx= new RegExp(J.link_rx);
        }
        gJDBobj=JDB;  
        console_log(gJDBobj);      
    }
    return gJDBobj ;
}

function JDBWLobj(){
    if (gJDBWLobj == null) {
        var JDB=fromJson(JDBWhiteStr);
        console_log(JDB);        
        for ( i=0 ; i< JDB.length ; i++ ) {
            var J = JDB[i];
            JDB[i]= new RegExp(J);
        }
        gJDBWLobj=JDB;  
        console_log(gJDBWLobj);   
    }
    return gJDBWLobj ;
}


function checkIt(request,b,c){
var u = request.url;
var w = window.location.href;
    for( var i=0; i<JDBWLobj().length; i++) {
        var rex =JDBWLobj()[i];
        if (w.match(rex)) {
            return 
        }
    }
    if(u) {
        //log("check:" + u);
        for( var i=0; i<JDBobj().length; i++) {
            var J =JDBobj()[i];
            var rex =J.link_rx;
            if ( u.match(rex)) {
                console_log("new checking - caught : " + u,rex);
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
        console_log(mode + ' : ' + node.nodeName);
        for( var attr of attribs) {
            if (node.hasAttribute(attr)) {
                var url = new URL_class(node.getAttribute(attr))
                if (url && notBlank(url.host)) {
                    for( var i=0; i<JDBobj().length; i++) {
                        var J =JDBobj()[i];
                        var rex =J.link_rx;
                        if (url.host.match(rex)) {
                            console_log("new myAdBlock " + mode + " :" + url.host, rex)
                            // if (mode=="LIVE") { alert("got you")}
                            node.setAttribute("hidden_"+attr, url.str()) ; //"javascript:void(0)")
                            node.setAttribute(attr, "about:blank") ; //"javascript:void(0)")
                            node.style.display ="none";
                            node.className="";
                            node.removeAttribute('class');
                            node.removeAttribute('id');
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
