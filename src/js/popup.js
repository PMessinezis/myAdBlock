

function send2Background(message){
    chrome.extension.sendRequest({message: message});
}

function showOptions(){

    chrome.runtime.openOptionsPage();
}

console_log("loading popup");

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('button#Show').addEventListener('click', showOptions);
});

