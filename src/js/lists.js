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
