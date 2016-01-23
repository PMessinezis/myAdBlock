

function send2Background(message){
    chrome.extension.sendRequest({message: message});
}
function showOptions(){
    chrome.runtime.openOptionsPage();
}
console.log("loading popup");

$("button#Show").click(function(){alert(sDump());});
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('button').addEventListener('click', showOptions);
});
