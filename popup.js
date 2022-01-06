'use strict';

var popUpStack = [];

function callPopUp() {
    let localStack = localStorage.getItem('stack');
    if (!localStack) {
        popUpStack = initStack();
    } else {
        popUpStack = JSON.parse(localStack);
    }
    alert(JSON.stringify(popUpStack))
    rebuildItems()
}

function rebuildItems() {
    for (var i=0; i< popUpStack.length; i++) {
        let item = popUpStack[i];
        var newElem = document.createElement("p");
        var newTxt = document.createTextNode( item.url );
        newElem.appendChild( newTxt );
        var newLi = document.createElement("li");
        newLi.appendChild ( newElem );
        var list = document.getElementById("items");
        list.appendChild( newLi );
    }
}

function initStack() {
    localStorage.setItem('stack', []);
    return [];
}
function pushStack(item) {
    alert(JSON.stringify(popUpStack))
    popUpStack.push(item);
    return item;
}
async function makeItem() {
    let item = templItem;
    const tab = await getCurrentTab();
    const url = tab.url;

    item.url.content = url;
    item.title.content = document.title;

    const elements = document.getElementsByTagName("h1");
    if (elements.length != 0) {
        item.headings.content = []
        for (let i=0; i<elements.length; i++) {
            item.headings.content.push(elements[i].textContent);
        }

        const summary = elements[0].nextElementSibling.textContent.substring(0, 50);
        item.summary.content = summary;
    }
    alert("item: "+JSON.stringify(item));
    pushStack(item.to_obj());
    rebuildItems()
}

let templItem = {
    url: {
        desc: "item's url"
    },
    title: {
        desc: "item's head title text"
    },
    headings: {
        desc: "item's h1 text"
    },
    summary:{
        desc: "item's summary. (h1 tag's next nextElementSibling text(0..50))"
    },
    to_obj: function() {
        return {
            "url": this.url.content,
            "title": this.title.content,
            "headings": this.headings.content,
            "summary": this.summary.content
        }
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
});
