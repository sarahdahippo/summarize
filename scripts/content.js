// all our scripts for the frontend, like DOM manipulation
const insert = (content) => {
    // find parent element of selection
    var parent = null
    if (window.getSelection) { // all modern browsers and IE9+
        selection = window.getSelection();
        if (selection.rangeCount) {
            parent = selection.getRangeAt(0).commonAncestorContainer;
            if (parent.nodeType != 1) {
                parent = parent.parentNode;
            }
        }
    } else if ((selection = document.selection) && selection.type != "Control") {
        parent = selection.createRange().parentElement();
    }

    // split content by new line
    const splitContent = content.split('\n');
  
    // wrap bullets in p tags
    splitContent.forEach((content) => {
        const p = document.createElement('p');
        p.textContent = content;
        p.style.color = 'red';
        p.style.fontWeight = 'bold';

        // insert into HTML
        parent.appendChild(p);
    });
  
    // on success, return true
    return true;
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'inject') {
        const { content } = request;
        const result = insert(content);
              
        // if something went wrong, send a failed status
        if (!result) {
          sendResponse({ status: 'failed' });
        }
        sendResponse({ status: 'success' });
    }
});
