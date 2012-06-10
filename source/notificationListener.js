enyo.kind({
	name: "notificationListener",
	kind: "Component",

	components: [
		{kind: "ApplicationEvents",
			onUnload: "cleanup"
		},
		
		{name: "dashboard", kind:"Dashboard", smallIcon: "dashboard-small.png", onMessageTap: "messageTap", 
				onIconTap: "iconTap", onUserClose: "dashboardClose", onLayerSwipe: "layerSwiped", onDashboardActivated: "dashboardActivated"},
	  
		{name: "appDashboard", kind: "Dashboard", smallIcon: "notification-small.png",  onMessageTap: "messageTap", onDashboardActivated: "dashboardActivated"},
	  
		{name : "getConnMgrStatus", kind : "PalmService", service : "palm://com.palm.connectionmanager/", method : "getStatus",
			onSuccess : "statusFinished", onFailure : "statusFail", onResponse : "gotResponse", subscribe : true },
	  
		{name: "loginBoxcar", kind: "WebService",
			url: "https://boxcar.io/devices/sessions/access_token",
			onSuccess: "loginSuccess",
			onFailure: "loginFailure"},
			
		{ name: "LaunchMe", kind: "PalmService", service: "palm://com.palm.applicationManager", method: "launch"},
		
		{ name : "fetchKey", kind : "PalmService", service : "palm://com.palm.keymanager", method : "fetchKey",
			onSuccess : "fetchKeySuccess", onFailure : "fetchKeyFailure", subscribe : true },
		{ name : "genKey", kind : "PalmService", service : "palm://com.palm.keymanager", method : "generate",
			onSuccess : "genKeySuccess", onFailure : "genKeyFailure", subscribe : true },
		{ name : "decryptData", kind : "PalmService", service : "palm://com.palm.keymanager", method : "crypt",
			onSuccess : "decryptDataSuccess", onFailure : "decryptDataFailure", subscribe : true },
		{ name : "encryptData", kind : "PalmService", service : "palm://com.palm.keymanager", method : "crypt",
			onSuccess : "encryptDataSuccess", onFailure : "encryptDataFailure", subscribe : true },
		
	],
	
	messageIcons: {
		GoogleVoice: "images/google_voice_512_normal_48.png",
		EmailAccount: "images/inboxWood_normal_48.png",
		Facebook: "images/facebook_icon_512_normal_48.png",
		Other: "images/all_messages.png"
	},
	
	messageIconsSmall: {
		GoogleVoice: "images/Small/google_voice_small.png",
		EmailAccount: "images/Small/inboxWood_small.png",
		Facebook: "images/Small/facebook_icon_small.png",
		Other: "images/Small/all_messages_small.png"
	},
	
	login: function(retryLogin){
		this.error(enyo.json.stringify(enyo.application.securePrefs));
		if(enyo.application.securePrefs['access_token'] == null || enyo.application.securePrefs['access_token'] == "" || typeof(a) != 'undefined'){
			this.error("Logging in with default credentials");
			enyo.windows.getRootWindow().launcher.$.loginBoxcar.call({username: enyo.application.securePrefs['username'], 
					 password: enyo.application.securePrefs['password'],
					 api_key: "MH0S7xOFSwVLNvNhTpiC"});
		} else {
			this.error("Trying to use old access_token");
			enyo.windows.getRootWindow().launcher.loginSuccess.call(this, {"access_token": enyo.application.securePrefs['access_token']});
		}
		//this.loginSuccess.call(this);
	},
	
	loginSuccess: function(inSender, inResponse, inRequest) {
		access_info = inResponse;
		if(typeof(access_info) == 'undefined'){
			access_info = { access_token: enyo.application.securePrefs['access_token'] };
		} else {
			enyo.application.securePrefs['access_token'] = access_info['access_token']; 
		}
		this.saveSecurePrefs();
		enyo.error("Login Successful");
		socket = new WebSocket("ws://farm.boxcar.io:8080/websocket");
		enyo.error("Socket Created");
		socket.onopen = function (evt) {
					enyo.error("Socket Opened");
					socket.send("{\"access_token\": \"" + access_info['access_token'] + "\"}");
				   };
		socket.onerror = function(evt) { 
			enyo.error("SocketError");
			enyo.error(evt.data);
			//enyo.windows.getRootWindow().launcher.login();
		};
		socket.onmessage = enyo.windows.getRootWindow().launcher.onMessage;
		socket.onclose = function(evt) {
			enyo.log("Socket Closed");
			//enyo.windows.getRootWindow().launcher.$.appDashboard.pop();
			//enyo.windows.getRootWindow().launcher.login();
			enyo.windows.addBannerMessage("Boxcar Socket Closed", enyo.windows.getRootWindow().launcher.messageIconsSmall['Other']);
		};
	},
	
	loginFailure: function(inSender, inResponse, inRequest){
		enyo.log("login failed");
	},
	
	messageTap: function(inSender, layer) {
		if(layer.text != "Listening for Notifications"){
			//this.$.status.setContent("Tapped on message: "+layer.text);
			if(layer.icon == this.messageIcons['GoogleVoice']){
				new AppLauncher().open("GVoice");
			} else if(layer.icon == this.messageIcons['Facebook']){
				new AppLauncher().open("Facebook");
			} else {
				this.relaunch(enyo.windowParams);
			}		
			this.$.dashboard.pop();
		} else {
			this.relaunch(enyo.windowParams);
		}
	},
	iconTap: function(inSender, layer) {
		//this.$.status.setContent("Tapped on icon for message: "+layer.text);
	},
	dashboardClose: function(inSender) {
		//this.$.status.setContent("Closed dashboard.");
	},
	layerSwiped: function(inSender, layer) {
		//this.$.status.setContent("Swiped layer: "+layer.text);
	},
	
	onMessage: function(evt){
		var messageData = enyo.json.parse(evt.data);
		var listener = enyo.windows.getRootWindow().launcher;
		enyo.error("Message Recieved!");
		if(messageData['message'] == "success"){
			enyo.log("Success");
			listener.$.appDashboard.push({icon: "images/Boxcar_icon.png", 
						title: "Boxcar", 
						text: "Listening for Notifications"});
			enyo.windows.addBannerMessage("Boxcar Logged In", listener.messageIconsSmall['Other']);
		} else if (messageData['error_code'] == null && messageData['message'] != null) {
			enyo.log(messageData);
			var messageIcon = "";
			var messageIconSmall = "";
			if(messageData['provider_name'] == "Google Voice"){
				messageIcon = listener.messageIcons['GoogleVoice'];
				messageIconSmall = listener.messageIconsSmall['GoogleVoice'];
			} else if(messageData['provider_name'] == "Email Account"){
				messageIcon = listener.messageIcons['EmailAccount'];
				messageIconSmall = listener.messageIconsSmall['EmailAccount'];
			} else if(messageData['provider_name'] == "Facebook Account"){
				messageIcon = listener.messageIcons['Facebook'];
				messageIconSmall = listener.messageIconsSmall['Facebook'];
			} else {
				//messageIcon = messageData['icon'];
				messageIcon = listener.messageIcons['Other'];
				messageIconSmall = listener.messageIconsSmall['Other'];
			}
			enyo.windows.addBannerMessage(messageData['from_screen_name'] + " - " + messageData['message'], '{}', messageIconSmall, 'defaultapp', 'default');
			listener.$.dashboard.push({icon: messageIcon, 
						title:messageData['from_screen_name'], 
						text:messageData['message']});
		}else  {
			if(messageData['error_code'] == 500){
				listener.login(true);
			}
			enyo.error(messageData);
		}
	},
	
	create: function (inSender, inEvent) {
		this.inherited(arguments);
		// here you can do any app initialization stuff - prefs, intitialize database, etc.
		// for this example, we'll just get some app preferences
		this.getPrefs();
	},
	// this is but one way of many for handling app preferences
	getPrefs: function () {
		//set up default prefs
		enyo.application.appPrefs = {
			keyGenerated: "false",
			pref2: 0,
		}		
		//get prefs from the cookie if they exist
		var cookie = enyo.getCookie("myAppPrefs");
		this.log(cookie);
		if (cookie) {
			// mixin will use the cookie value of the pref
			// if it exists, else use the default
			enyo.application.appPrefs = enyo.mixin(enyo.application.appPrefs, enyo.json.parse(cookie));
		}	
		this.getSecurePrefs();
	},
	savePrefs: function () {
		//this.log("Saving Prefs");
		enyo.setCookie("myAppPrefs", enyo.json.stringify(enyo.application.appPrefs));
	},
 
	// cleanup was defined above as the onUnload handler for application events
	// we'll use it to save any changes to our appPrefs
	cleanup: function () {
		this.log("Cleanup in appLaunch");
		this.savePrefs();
		enyo.log("Closing...");
		if(this.socket){
			this.socket.close();
			delete this.socket;
		}
		//params = { action: "doSomething" };
		//this.$.LaunchMe.call({"id" : "com.invalidopcode.boxcar", "params": params});
	},	
	
	constructor: function() {
		this.inherited(arguments);
	},
	
	
	startup: function () {
		this.log("Startup in notificationListener");
		// Get the initial launch parameters to pass to the relaunch handler
		// since this is the first time the window is opened
		// subsequent launches will call relaunch() directly through
		// the applicationRelaunchHandler defined in index.html
		var params = enyo.windowParams;
		enyo.log(params);
		
		enyo.application.lastNetworkStatusUp = false;
		
		if(enyo.application.securePrefs['username'] == ""){
			this.relaunch(params);
		} else {
			this.getStatus();
		}
		//this.login();
		
		//this.relaunch(params);
		
	},
	
	relaunch: function (params) {
		this.log("Relaunch in myAppLaunch", params);
 
		// check to see if main app window is already open
		var appWindow = enyo.windows.fetchWindow("mainApp");
 
		// check to see if a special param has been sent to the app
		// in this case, we may have defined a params.action property in
		// JustType to tell the app to do something. Let's assume that our
		// params are either:  {action: "addData", data: "Some data"} or
		//                     {action: "doSomething"}
		if (params.action) {
			switch (params.action) {
				case "addData":
					// open the main window and pass the params along
					this.openCard("mainApp", params, false);
					break;
				case "doSomething":
					// if the main app is already open, do one thing
					// if not, do something else
					if (appWindow) {
						this.openCard("mainApp", params, false);
					}
					else {
						break;
					}
 
					break;
				case "openHeadless":
					enyo.error("Opening Headless");
					break;
			}
		}
		else {
			this.openCard("mainApp", params, false);	
		}
	},
 
	openCard: function (type, windowParams, forceNewCard) {
		var name, path, basePath, existingWin;
 
		name = type;
		this.log(arguments);
		basePath = enyo.fetchAppRootPath() + "/";
 
		// this assumes a /mainApp folder under the applications root
		// path with a separate index.html to launch the mainApp window
		if (type === "mainApp") {
			path = basePath + "/source/mainApp/index.html";
		}
		// or if we wanted to launch a different window
		else if (type === "somethingElse") {		
			path = basePath + "somethingElse/index.html";
 
		} 
		else {
			console.error("unknown launch type " + type);
			return; // bail out
		}
 
		// open the window	
		var window = enyo.windows.activate(path, name, windowParams);
		return window;
 
	},
	
	statusFinished : function(inSender, inResponse) {
		enyo.log("getStatus success, results=" + enyo.json.stringify(inResponse));
		if(inResponse['isInternetConnectionAvailable'] == true && enyo.application.lastNetworkStatusUp == false){
			enyo.application.lastNetworkStatusUp = true;
			enyo.windows.getRootWindow().launcher.login();
		}
	},
	statusFail : function(inSender, inResponse) {
		enyo.log("getStatus failure, results=" + enyo.json.stringify(inResponse));
	},
	getStatus : function(inSender, inResponse)
	{
		this.$.getConnMgrStatus.call({ "subscribe": true });
	},
	
	getSecurePrefs: function() {
		//localStorage.removeItem('securePrefs');
		enyo.application.securePrefs = {
			access_token: "",
			password: "",
			username: ""
		};
		//enyo.error("fetching key...");
		//this.$.fetchKey.call({"keyname":"boxcarKey"});
		if(localStorage.getItem('securePrefs') != null){
			enyo.application.securePrefs = enyo.json.parse(localStorage.getItem('securePrefs'));
		}
	},
	
	saveSecurePrefs: function() {
		enyo.error("Saving: " + enyo.json.stringify(enyo.application.securePrefs));
		localStorage.setItem('securePrefs', enyo.json.stringify(enyo.application.securePrefs));
		//this.$.encryptData.call({ "keyname":"boxcarKey", "algorithm":"AES", "decrypt":false, 
        //                         "data": base64_encode(enyo.json.stringify(enyo.application.securePrefs))});
	},
	
	fetchKeySuccess: function(inSender, inResponse) {
		
		if(enyo.getCookie("securePrefs")){
			enyo.error("decrypting data....");
			this.$.decryptData.call({ "keyname":"boxcarKey", "algorithm":"AES", "decrypt":true, 
                                 "data": enyo.getCookie("securePrefs")});
		} else {
			enyo.error("localStorage null!");
		}
	},
	
	fetchKeyFailure: function(inSender, inError, inResponse) {
		this.error(enyo.json.stringify(inError));
		this.$.genKey.call({"keyname":"boxcarKey", "type":"AES", "nohide":true, "size":16});
	},
	
	genKeySuccess: function(inSender, inResponse) {
		this.error("keyGenerated..");
		this.getSecurePrefs();
	},         
	
	// Log errors to the console for debugging
	genKeyFailure: function(inSender, inError, inRequest) {
		this.error("keyGenerated failed");
		this.error(enyo.json.stringify(inError));
	},
	
	decryptDataSuccess: function(inSender, inResponse) {
		enyo.application.securePrefs = enyo.mixin(enyo.application.appPrefs, enyo.json.parse(base64_decode(inResponse['data'])));
		enyo.error("SecurePrefs decrypted - " + enyo.json.stringify(enyo.application.securePrefs));
	},
	
	encryptDataSuccess: function(inSender, inResponse) {
		this.error("Data encrypted... saving");
		this.error(inResponse['data']);
		enyo.setCookie("securePrefs", inResponse['data']);
	},
	
	// Log errors to the console for debugging
	encryptDataFailure: function(inSender, inError, inRequest) {
		this.error(enyo.json.stringify(inError));
	},
	
	// Log errors to the console for debugging
	decryptDataFailure: function(inSender, inError, inRequest) {
		this.error(enyo.json.stringify(inError));
	},

	dashboardActivated: function(dash) {
        	for(l in dash)
        	{
            		var c = dash[l].dashboardContent;
            		if(c)
            		{
                		c.$.topSwipeable.applyStyle("background-color", "black");
            		}
        	}
    	},
});
