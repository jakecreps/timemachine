var interval;
var waybackLink, archiveIsLink/*, googleLink*/, bingLink;
var archivesDone = 0;

function getWaybackArchives(waybackURLS) {
	chrome.runtime.sendMessage(
	{contentScriptQuery: 'wayback', urls: waybackURLS},
	data => {
		for(var i = 0; i < waybackURLS.length; i++) {
			if(data[i].archived_snapshots.closest) {
				if(data[i].archived_snapshots.closest.available) {
					waybackLink = 'https://web.archive.org/web/*/' + waybackURLS[i].split('http://archive.org/wayback/available?url=')[1];
				}
			}
			archivesDone += 1;
		}
	}
	);
}

function getArchiveIsArchives(archiveIsURLS) {
	chrome.runtime.sendMessage(
	{contentScriptQuery: 'archive.is', urls: archiveIsURLS},
	data => {
		for(var i = 0; i < archiveIsURLS.length; i++) {
			if(isArchiveIsAvailable(data[i])) {
				archiveIsLink = archiveIsURLS[i];
			}
			archivesDone += 1;
		}
	}
	);
}

/*function getGoogleArchives(googleURLS) {
	chrome.runtime.sendMessage(
	{contentScriptQuery: 'google', urls: googleURLS},
	data => {
		for(var i = 0; i < googleURLS.length; i++) {
			if(isGoogleAvailable(data[i])) {
				googleLink = googleURLS[i];
			}
			archivesDone += 1;
		}
	}
	);
}*/

function getBingArchives(bingURLS) {
	chrome.runtime.sendMessage(
	{contentScriptQuery: 'bing', urls: bingURLS},
	data => {
		for(var i = 0; i < bingURLS.length; i++) {
			if(isBingAvailable(data[i])) {
				bingLink = bingURLS[i];
			}
			archivesDone += 1;
		}
	}
	);
}

function getLinks() {
	var links = [];
	if(waybackLink != undefined)
		links[links.length] = waybackLink;
	if(archiveIsLink != undefined)
		links[links.length] = archiveIsLink;
	/*if(googleLink != undefined)
		links[links.length] = googleLink;*/
	if(bingLink != undefined)
		links[links.length] = bingLink;
	return links;
}

function openArchives() {
	if(archivesDone == 3) {
		console.log('All archives retrieved!');
		clearInterval(interval);
		if(getLinks().length > 0) {
			chrome.runtime.sendMessage({contentScriptQuery: 'activeIcon'});
			chrome.runtime.sendMessage({contentScriptQuery: 'setLinks', urls: getLinks()});
		}
		else
			chrome.runtime.sendMessage({contentScriptQuery: 'grayIcon'});
	}
	else
		console.log('Still getting ' + (3 - archivesDone) + ' archives!');
}

function isArchiveIsAvailable(DOM) {
	let htmlObject = $(DOM).find('#CONTENT');
	if($(htmlObject)[0].childNodes[0].data == 'No results')
		return false;
	else return true;
}

/*function isGoogleAvailable(DOM) {
	let htmlObject = $(DOM)[3].tagName;
	if(htmlObject != 'DIV')
		return false;
	else return true;
}*/

function isBingAvailable(DOM) {
	let htmlObject = $(DOM).find('#b_tween');
	if(htmlObject.length < 1)
		return false;
	else return true;
}

chrome.runtime.sendMessage({contentScriptQuery: 'getActiveTab'}, data => {
	var tabURL = data;
	chrome.runtime.sendMessage({contentScriptQuery: 'grayIcon'});
	getWaybackArchives(['http://archive.org/wayback/available?url=' + tabURL]);
	getArchiveIsArchives(['https://archive.is/' + tabURL]);
	//getGoogleArchives(['https://webcache.googleusercontent.com/search?strip=1&q=cache:' + tabURL]);
	getBingArchives(['https://www.bing.com/search?q=url:' + tabURL + '&go=Search&qs=bs&form=QBRE']);
});


interval = setInterval(openArchives, 250);