var url = document.URL;
var isDash = url.includes("dashboard") && url.includes("StarRezWeb");

function fetchPackageInfo(element){
	var dict = [];
	var columns = element.children;
	var email = columns[1].children[0].textContent;
	if(email === ""){
		return "";
	}
	var name = columns[0].children[0].textContent;
	var date = columns[2].children[0].textContent;
	
	var packageInfo = name + ";" + email + ";" + date;
	return packageInfo;
}

function parseEmail(source){
	var parser = new DOMParser();
	var doc = parser.parseFromString(source, "text/html");
	var divTags = doc.getElementsByClassName("dashboard-item-container ui-dashboard-item-container");
	var packageTag = divTags[0];

	var output = "";
	for(var i = 0; i < divTags.length; i++){
		tag = divTags[i];
		if(tag.children[0].id.localeCompare("data_693") == 0){
			packageTag = tag.children[0];
			break;
		}
	} 
	var packages = packageTag.children[3].children[0];
	var packageMap = [];

	for(var i = 0; i < packages.children.length; i++){
		packageInfo = fetchPackageInfo(packages.children[i]);
		if(packageInfo !== ""){
			packageMap.push(packageInfo);	
		}
	}

	return packageMap;
}

if(isDash){
	packageMap = parseEmail(document.documentElement.innerHTML);
	
	chrome.runtime.sendMessage({
    	action: "getEmails",
    	data: JSON.stringify(packageMap)
	});
	
}

