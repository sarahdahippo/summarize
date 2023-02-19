// get + decode API key
const getKey = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['openai-key'], (result) => {
            if (result['openai-key']) {
                const decodedKey = atob(result['openai-key']);
                resolve(decodedKey);
            }
        });
    });
};

// messenger to send messages to our UI by injecting value into the DOM
const sendMessage = (content) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // find currently active tab
        const tab = tabs.find(tab => tab.active && tab.selected);
        if (tab) {
            const activeTab = tab.id;
            chrome.tabs.sendMessage(
                activeTab,
                { message: 'inject', content },
                (response) => {
                    if (response.status === 'failed') {
                        console.log('injection failed.');
                    }
                }
            );
        }
    });
};

const generate = async (prompt) => {
    // get API key from storage
    const key = await getKey();
    const url = 'https://api.openai.com/v1/completions';
    const completionResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 1250,
            temperature: 0.7,
        }),
    });
	
    const completion = await completionResponse.json();
    
    // select the best choice and send back
    return completion.choices.pop();
};

const summarizeParagraph = async (info) => {
    try {
        // send loading indicator
        sendMessage('Generating summary...');
        const { selectionText } = info;
        const basePromptPrefix = `
        Summarize, in bullet points, the paragraph below.
    
        Paragraph:
        `;
        
        const summary = await generate(`${basePromptPrefix}${selectionText}`);
        console.log(summary.text);
        sendMessage(summary.text);
    } catch (error) {
        console.log(error);
        sendMessage(error.toString());
    }
};

// when the extension is installed, create a new option in our on-right-click menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'context-run',
        title: 'Summarize paragraph',
        contexts: ['selection'],
    });
});
  
chrome.contextMenus.onClicked.addListener(summarizeParagraph);