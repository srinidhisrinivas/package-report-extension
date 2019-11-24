/**

	Function that parses package information from a string and stores them in a map
	of emails -> object containing all package information

	Receives a list of strings of the form "LastName, FirstName;Email;ReceiptDateAndTime"

	Returns a map of the emails -> object containing all package information

**/ 
function parseData(data){

	var packageMap = new Map();

	for(var i = 0; i < data.length; i++){
		
		var info = data[i].split(";");
		
		var packageInfo = {
			name: info[0],
			email: info[1],
			date: info[2]
		};
		
		// Store only oldest package for person
		if(!packageMap.has(packageInfo.email)){
			packageMap.set(packageInfo.email, packageInfo);	
		}
	}
	
	return packageMap;
}

/**

	Function that operates the main functionality of the extension.

	It works by calling a content script, 'contentscript.js' to run on the current web page.
	The content script checks if the current web page is the StarRez dashboard, and if it is,
	collect the package details from the webpage and send it as a Chrome runtime message to this function.

	This function, when a message is received, performs the necessary operations to copy the
	emails from the received package data to the clipboard in the required format.

**/ 

function onWindowLoad() {
  var isDash = false;

  // Collect elements (textbox, input number, button) from HTML doc ('popup.html')
  var text = document.getElementById("ptext");
  var inp = document.getElementById("numDays");
  var butt = document.getElementById("copyAddress");

  // Set up listener for a message from content script
  chrome.runtime.onMessage.addListener(function(request, sender) {
		isDash = true;
	  	if (request.action == "getEmails") {
	  		data = request.data;
	  		
	  	}

	  	// Pass all the package data and get back only emails and their dates.
	  	packageMap = parseData(JSON.parse(data));

	  	// Set up listener for the button being clicked
	  	butt.addEventListener('click', function(){

	  		// Get the number of days from the input box
		  	var numDays = inp.value;
		  	var one_day = 1000*60*60*24;

		  	// Define the delimiter for the emails 
		  	// (This is the character that separates each email.
		  	//  Use newline '\n' or semi-colon ';' for Outlook Mail)

		  	var delimiter = '\n';
		  	var emails = "";
		  	var count = 0;
		  	
		  	// Iterate through all received email IDs and package receipt dates
		  	for(const [email, info] of packageMap.entries()){

		  		// Get the date of receipt and format it into a Date object (yyyy, mm, dd)
		  		var day = info.date.split(" ")[0];
		  		var mmddyyyy = day.split("/");

		  		// Month indices are 0-January, 1-February ... 11-December
		  		var date_formatted = new Date(mmddyyyy[2], mmddyyyy[0]-1, mmddyyyy[1]);
		  		var today = new Date();

		  		// Compute how many days old package is
		  		var difference = (today - date_formatted) / one_day;
		  		
		  		// Add the email if it is older than the specified number of days
		  		if(difference >= numDays){
		  			count++;
		  			emails += email+delimiter;
		  		}
		  		
		  	}

		  	/**

		  		Function to copy the string of emails to the clipboard for pasting

		  	**/
		  	function copyToClipboard(text) {
			    var dummy = document.createElement("textarea");
			    document.body.appendChild(dummy);
			    dummy.value = text;
			    dummy.select();
			    document.execCommand("copy");
			    document.body.removeChild(dummy);

			}

			// If packages older than specified number of days are found,
			// copy the emails to clipboard and alert user.

			if(count <= 0){
				alert('No packages older than '+numDays+' days old!')
			} else {
				copyToClipboard(emails);
				alert(count + ' emails copied to clipboard!');	
			}
		  	
		  });

	  	// Enable input and button when on correct page
	  	butt.disabled=false;
	  	inp.disabled=false;

	  	// Change the text when on correct page. There might be a better way to do this lol.
		text.innerText = "Congratulations on making it to the right place!"
	  	text.innerText += "\n\nREMEMBER: Make sure you scroll all the way down on the 'Bradley Paterson Package Log' before opening the extension to account for all the packages."
	  	text.innerText += "\n\nClick 'Copy Addresses' and then you can Right Click->Paste or Ctrl+V in Outlook to add these emails as recipients."

		});

  // Execute content script on webpage
  chrome.tabs.executeScript(null, {
    file: "contentscript.js"
  }, null);

}

// Set the function that is executed when the extension is opened (window is loaded)
// Execution starts at this point.

window.onload = onWindowLoad;