var links = [];
//var googleURLS = [];

function getWaybackArchive(url) {
	return new Promise(resolve => {
		fetch(url)
			.then(response => response.json())
			.then(data => resolve(data))
			.catch(error => console.log(error));
	}, 250);
}

function getArchiveIsArchive(url) {
	return new Promise(resolve => {
		fetch(url)
			.then(response => response.text())
			.then(data => resolve(data))
			.catch(error => console.log(error));
	}, 250);
}

/*function getGoogleArchive(url) {
	return new Promise(resolve => {
		fetch(url)
			.then(response => response.text())
			.then(data => resolve(data))
			.catch(error => console.log(error));
	}, 250);
}*/

function getBingArchive(url) {
	return new Promise(resolve => {
		fetch(url)
			.then(response => response.text())
			.then(data => resolve(data))
			.catch(error => console.log(error));
	}, 250);
}

/*function isGoogleAvailable(DOM) {
	let htmlObject = $(DOM)[3].tagName;
	if(htmlObject != 'DIV')
		return false;
	else return true;
}*/

chrome.browserAction.onClicked.addListener((tabs) => {
	chrome.tabs.executeScript(null,{file:"openArchives.js"});
})

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    if(request.contentScriptQuery == "wayback") {
		(async () => { 
			var archives = [];
			for(var i = 0; i < request.urls.length; i++) {
				archives[i] = await getWaybackArchive(request.urls[i]);
			}
			sendResponse(archives);
		})();
    }
	else if(request.contentScriptQuery == "archive.is") {
		(async () => { 
			var archives = [];
			for(var i = 0; i < request.urls.length; i++) {
				archives[i] = await getArchiveIsArchive(request.urls[i]);
			}
			sendResponse(archives);
		})();
	}
	/*else if(request.contentScriptQuery == "google") {
		(async () => { 
			var archives = [];
			for(var i = 0; i < request.urls.length; i++) {
				archives[i] = await getGoogleArchive(request.urls[i]);
			}
			sendResponse(archives);
		})();
	}*/
	else if(request.contentScriptQuery == "bing") {
		(async () => { 
			var archives = [];
			for(var i = 0; i < request.urls.length; i++) {
				archives[i] = await getBingArchive(request.urls[i]);
			}
			sendResponse(archives);
		})();
	}
	else if(request.contentScriptQuery == "setLinks") {
		links = request.urls;
	}
	else if(request.contentScriptQuery == "openLinks") {
		for(var i = 0; i < links.length; i++)
			chrome.tabs.create({url: links[i]});
	}
	else if(request.contentScriptQuery == "grayIcon") {
		chrome.browserAction.setIcon({path: chrome.extension.getURL('icon2.png')});
		links = [];
	}
	else if(request.contentScriptQuery == "activeIcon") {
		chrome.browserAction.setIcon({path: chrome.extension.getURL('icon.png')});
	}
	else if(request.contentScriptQuery == "getActiveTab") {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			sendResponse(tabs[0].url);
		});
	}
	/*else if(request.contentScriptQuery == "checkGoogle") {
		(async () => { 
			var archive = await getGoogleArchive(googleURLS[request.index]);
			if(isGoogleAvailable(archive)) {
				window.open(googleURLS[request.index], '_blank');
			}
		})();
	}
	else if(request.contentScriptQuery == "setGoogleURLS") {
		googleURLS = request.urls;
		sendResponse(true);
	}*/
	return true;
});