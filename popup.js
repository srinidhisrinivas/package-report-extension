function parseData(data){

	var packageMap = new Map();

	for(var i = 0; i < data.length; i++){
		
		var info = data[i].split(";");
		
		var packageInfo = {
			name: info[0],
			email: info[1],
			date: info[2]
		};
		
		packageMap.set(packageInfo.email, packageInfo);
	}
	
	return packageMap;
}

function onWindowLoad() {
  var isDash = false;
  var text = document.getElementById("ptext");
  var inp = document.getElementById("numDays");
  var butt = document.getElementById("copyAddress");

  
  chrome.runtime.onMessage.addListener(function(request, sender) {
		isDash = true;
	  	if (request.action == "getEmails") {
	  		data = request.data;
	  		
	  	}

	  	packageMap = parseData(JSON.parse(data));
	  	butt.addEventListener('click', function(){
		  	var numDays = inp.value;
		  	var one_day = 1000*60*60*24;

		  	var delimiter = '\n';
		  	var emails = "";
		  	var count = 0;
		  	
		  	for(const [email, info] of packageMap.entries()){
		  		var day = info.date.split(" ")[0];
		  		var mmddyyyy = day.split("/");
		  		var date_formatted = new Date(mmddyyyy[2], mmddyyyy[0]-1, mmddyyyy[1]);
		  		var today = new Date();

		  		var difference = (today - date_formatted) / one_day;
		  		
		  		if(difference >= numDays){
		  			count++;
		  			emails += email+delimiter;
		  		}
		  		
		  	}

		  	function copyToClipboard(text) {
			    var dummy = document.createElement("textarea");
			    document.body.appendChild(dummy);
			    dummy.value = text;
			    dummy.select();
			    document.execCommand("copy");
			    document.body.removeChild(dummy);

			}

			copyToClipboard(emails);
			
			if(count <= 0){
				alert('No packages older than '+numDays+' days old!')
			} else {
				alert(count + ' emails copied to clipboard!');	
			}
		  	
		  });

	  	butt.disabled=false;
	  	inp.disabled=false;

		text.innerText = "Congratulations on making it to the right place!"
	  	text.innerText += "\n\nREMEMBER: Make sure you scroll all the way down on the 'Bradley Paterson Package Log' to account for all the packages."
	  	text.innerText += "\n\nClick 'Copy Addresses' and then you can Right Click->Paste or Ctrl+V in Outlook to add these emails as recipients."

		});

  chrome.tabs.executeScript(null, {
    file: "contentscript.js"
  }, null);

}

window.onload = onWindowLoad;