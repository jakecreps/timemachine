var searchResults = [];
var waybackResults = [];
var waybackURLS = [];
var archiveIsURLS = [];
//var googleURLS = [];
var bingURLS = [];

var interval;
var waybackLinks = [], archiveIsLinks = []/*, googleLinks = []*/, bingLinks = [];
var archivesDone = 0;
//var googleLink;

function getArchiveLink(archiveURLS/*, index*/) {
	var icon = document.createElement('img');
	icon.src = chrome.extension.getURL('icon.png');
	icon.style.height = '20px';
	icon.style.width = '20px';
	icon.style.marginTop = '7px';
    icon.style.marginRight = '7px';
	icon.style.float = 'left';
	icon.addEventListener("click", function() {
		for(var i = 0; i < archiveURLS.length/* - 1*/; i++)
			window.open(archiveURLS[i], '_blank');
			//chrome.runtime.sendMessage({contentScriptQuery: 'checkGoogle', index: index});
			//checkGoogle(index);
	});
	if(archiveURLS.length < 1)
		icon.style.filter = 'grayscale(100%)';
	return icon;
}

/*function checkGoogle(i) {
	chrome.runtime.sendMessage({contentScriptQuery: 'checkGoogle', index: i});
}*/

function getIconLinks(i) {
	var links = [];
	if(waybackLinks[i] != undefined)
		links[links.length] = 'https://web.archive.org/web/*/' + waybackLinks[i];
	if(archiveIsLinks[i] != undefined)
		links[links.length] = 'https://archive.is/' + archiveIsLinks[i];
	/*if(googleLinks[i] != undefined)
		links[links.length] = 'https://webcache.googleusercontent.com/search?q=cache:' + googleLinks[i];*/
	if(bingLinks[i] != undefined)
		links[links.length] = 'https://www.bing.com/search?q=url:' + bingLinks[i] + '&go=Search&qs=bs&form=QBRE';
	return links;
}

function addArchiveButtons() {
	if(archivesDone == 3) {
		console.log('All archives retrieved!');
		clearInterval(interval);
		for(var i = 0; i < searchResults.length; i++) {
			if(getIconLinks(i).length > 0) {
				searchResults[i].parentElement.appendChild(getArchiveLink(getIconLinks(i)/*, i*/));
			}
		}
	}
	else
		console.log('Still getting ' + (3 - archivesDone) + ' archives!');
}

function getWaybackArchives(waybackURLS) {
	chrome.runtime.sendMessage(
	{contentScriptQuery: 'wayback', urls: waybackURLS},
	data => {
		for(var i = 0; i < searchResults.length; i++) {
			if(data[i].archived_snapshots.closest) {
				if(data[i].archived_snapshots.closest.available)
					waybackLinks[i] = searchResults[i];
				else
					waybackLinks[i] = undefined;
			}
		}
		archivesDone += 1;
	}
	);
}

function getArchiveIsArchives(archiveIsURLS) {
	chrome.runtime.sendMessage(
	{contentScriptQuery: 'archive.is', urls: archiveIsURLS},
	data => {
		for(var i = 0; i < searchResults.length; i++) {
			if(isArchiveIsAvailable(data[i]))
				archiveIsLinks[i] = searchResults[i];
			else
				archiveIsLinks[i] = undefined;
		}
		archivesDone += 1;
	}
	);
}

/*function getGoogleArchives(googleURLS) {
	chrome.runtime.sendMessage(
	{contentScriptQuery: 'google', urls: googleURLS},
	data => {
		for(var i = 0; i < searchResults.length; i++) {
			if(isGoogleAvailable(data[i]))
				googleLinks[i] = searchResults[i];
			else
				googleLinks[i] = undefined;
		}
		archivesDone += 1;
	}
	);
}*/

function getBingArchives(bingURLS) {
	chrome.runtime.sendMessage(
	{contentScriptQuery: 'bing', urls: bingURLS},
	data => {
		for(var i = 0; i < searchResults.length; i++) {
			if(isBingAvailable(data[i]))
				bingLinks[i] = searchResults[i];
			else
				bingLinks[i] = undefined;
		}
		archivesDone += 1;
	}
	);
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

var searchResultsUnparsed = document.getElementsByClassName('g');
for(var i = 0; i < searchResultsUnparsed.length; i++) {
	if(searchResultsUnparsed[i].className == 'g' && searchResultsUnparsed[i].parentNode.parentNode.parentNode.id == 'search')
		searchResults[searchResults.length] = searchResultsUnparsed[i].getElementsByTagName('a')[0];
}

for(var i = 0; i < searchResults.length; i++) {
	waybackURLS[i] = 'http://archive.org/wayback/available?url=' + searchResults[i].href;
	archiveIsURLS[i] = 'https://archive.is/' + searchResults[i].href;
	//googleURLS[i] = 'https://webcache.googleusercontent.com/search?strip=1&q=cache:' + searchResults[i].href;
	bingURLS[i] = 'https://www.bing.com/search?q=url:' + searchResults[i].href + '&go=Search&qs=bs&form=QBRE';
}

/*chrome.runtime.sendMessage(
	{contentScriptQuery: 'setGoogleURLS', urls: googleURLS},
	data => {*/
		(async () => { await getWaybackArchives(waybackURLS); })();
		(async () => { await getArchiveIsArchives(archiveIsURLS); })();
		//(async () => { await getGoogleArchives(googleURLS); })();
		(async () => { await getBingArchives(bingURLS); })();
		interval = setInterval(addArchiveButtons, 250);
	/*}
);*/