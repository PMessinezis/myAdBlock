//<button id="list">List </button>
//<button id="showAll">Show All</button>
//<button id="saveAll">Save</button>
//<button id="clearAll">DELETE ALL !!!</button>


function send2Background(message){
    chrome.extension.sendRequest({message: message});
}
function showDump(){
	var v=sKeys().join();
	$("div#dump").html(v);
}
function askDump(){
	var message={action: "sDump", func: showDump }
    send2Background(message);
}

function assignFunc(node,event,func){
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector(node).addEventListener(event, func); }
)}


function selectFile(){
    $("input[type=file]").on('change',function(){
        readFile(this.files[0]);
    });
    fileInput.click();
}

function readFile(theFile){
    var fileInput = htmlnode("input#fileInput");
    var reader = new FileReader();
    reader.onload = function(e) { processFileText(reader.result); }
    reader.readAsText(theFile);
}


function processFileText(T){
    sPutJSON(T);
    show(sDumpJSON());
}

function show(s){
    $("textarea#output").html(s)
}


// myPOST_JSON(url, params, asynch, onsuccess, onfail) 
function checkIt(o){
     var a=JSON.parse(o);
     if (isArray(a) && a.length>0 ){
     	show(o);
     	//alert(o);
     	sFlush();
     }
}


function uploadQDumps(){
    var J=sDumpJSON(/^QDump_/);

    if (J){
        J='{ "storage" : ' + J + " }";
        myPOST_JSON("http://messinezis.homeip.net/storage", J, true, checkIt , show) 
    }
}

console_log("Opening Options page");


assignFunc("button#list","click", function(e){ show(sKeys()) } )

assignFunc("button#showAll","click", function(e){ show(sDumpJSON()) } )

assignFunc("button#saveAll","click", function(e){
            Save2File(sDumpJSON(),"storage" + moment().format("YYYYMMDDHHmmss") + ".json"); } );

assignFunc("button#clearAll","click", function(e){ sFlush();show(sDumpJSON()) } )

assignFunc("button#upload","click", function(e){ selectFile() } )


