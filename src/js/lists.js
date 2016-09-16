// handle lists (blacklist and whitelist) as well as init from central web server

var myAdBlockCounter=0;
function actionLog(action,badHost){
    myAdBlockCounter+=1;
    //chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 230]});
    if (chrome.browserAction) chrome.browserAction.setBadgeText({text:myAdBlockCounter.toString()});

}

base_adRegEx=[
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

gJDBobj = null ;

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
        console.log(JDB);        
    }
    return gJDBobj ;
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
