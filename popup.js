'use strict';

var popUpStack = [];

function callPopUp() {
    let localStack = localStorage.getItem('stack');
    if (!localStack) {
        popUpStack = initStack();
    } else {
        popUpStack = JSON.parse(localStack);
    }
    rebuildItems();
}

function rebuildItems() {
    var list = document.getElementById('items');
    list.innerHTML = '';

    for (var i=0; i< popUpStack.length; i++) {
        const id_name = i + '_del_li';

        let item = popUpStack[i];
        var newElem = document.createElement('p');
        newElem.classList.add('is-size-7');
        newElem.setAttribute('id', id_name)

        var newDelete = document.createElement('BUTTON');
        newDelete.classList.add('delete');
        newDelete.classList.add('is-small');
        newDelete.addEventListener('click', removeItem);
        newElem.appendChild(newDelete);

        var newTxt = document.createTextNode(' ' + item.url);
        newElem.appendChild(newTxt);

        var newLi = document.createElement('li');
        newLi.appendChild(newElem);
        list.appendChild(newLi);
    }
}

function removeItem(e) {
    let index = e.target.parentElement.id.split('_')[0];
    var end = 0;
    if (index == 0){
        end = index + 1;
    } else {
        end = index;
    }
    popUpStack.splice(index, end);
    localStorage.setItem('stack', JSON.stringify(popUpStack));
    rebuildItems();
}

function initStack() {
    localStorage.setItem('stack', []);
    return [];
}
function pushStack(item) {
    popUpStack.push(item);
    localStorage.setItem('stack', JSON.stringify(popUpStack));
    return item;
}
async function makeItem() {
    let item = templItem;
    item.clear();
    const tab = await getCurrentTab();
    const url = tab.url;

    item.url.content = url;
    item.title.content = document.title;

    const elements = document.getElementsByTagName('h1');
    if (elements.length != 0) {
        item.headings.content = []
        for (let i=0; i<elements.length; i++) {
            item.headings.content.push(elements[i].textContent);
        }

        const summary = elements[0].nextElementSibling.textContent.substring(0, 50);
        item.summary.content = summary;
    }
    pushStack(item.to_obj());
    rebuildItems();
}

let templItem = {
    category: {
        desc: 'item\'s category'
    },
    url: {
        desc: 'item\'s url'
    },
    title: {
        desc: 'item\'s head title text'
    },
    headings: {
        desc: 'item\'s h1 text'
    },
    summary:{
        desc: 'item\'s summary. (h1 tag\'s next nextElementSibling text(0..50))'
    },
    clear: function() {
        this.url.content = '';
        this.title.content = '';
        this.headings.content = '';
        this.summary.content = '';
    },
    to_obj: function() {
        return {
            'url': this.url.content,
            'title': this.title.content,
            'headings': this.headings.content,
            'summary': this.summary.content
        }
    },
    to_line: function() {
        var line = '';
        if (!this.url.content){
            line += ',';
        } else {
            line += this.url.content+',';
        }
        if (!this.title.content){
            line += ',';
        } else {
            line += this.title.content+',';
        }
        if (!this.headings.content){
            line += ',';
        } else {
            line += this.headings.content+',';
        }
        if (!this.summary.content){
        } else {
            line += this.summary.content;
        }
        return line;
    },
    convert_line: function(arg) {
        var line = '';
        if (!arg.url){
            line += ',';
        } else {
            line += arg.url+',';
        }
        if (!arg.title){
            line += ',';
        } else {
            line += arg.title+',';
        }
        if (!arg.headings){
            line += ',';
        } else {
            line += arg.headings+',';
        }
        if (!arg.summary){
        } else {
            line += arg.summary;
        }
        return line+'\n';
    }
}

function downloadStockAsCSV() {
    let title = window.prompt('Label current urls stock', '');
    if (!title) {
        title = '';
    }
    var content = '';
    for (var i=0; i< popUpStack.length; i++) {
        let item = popUpStack[i];
        content += templItem.convert_line(item);
    }
    let bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    var blob = new Blob([ bom, content ], { 'type' : 'text/csv' });
    let file_name = 'volaStock_' + title + '.csv';
    var download_node = document.getElementById('download');
    download_node.setAttribute('download', file_name)
    if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, file_name);
        window.navigator.msSaveOrOpenBlob(blob, file_name);
    } else {
        download_node.href = window.URL.createObjectURL(blob);
    }
}

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

callPopUp();

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.btn').addEventListener('click', makeItem);
    document.querySelector('.download').addEventListener('click', downloadStockAsCSV);
});
