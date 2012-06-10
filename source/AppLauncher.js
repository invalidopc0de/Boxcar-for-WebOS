enyo.kind({
	name: "AppLauncher",
	kind: enyo.Request,
	components: [
		{ name: "LaunchApp", kind: "PalmService", service: "palm://com.palm.applicationManager", method: "launch", onSuccess: "GVoiceLaunched", onFailure: "GVoiceFailed" },
		{ name: "WebLauncher", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open", onSuccess: "webBrowserLaunched", onFailure: "webBrowserFailed" },
	],
	open: function(app)
	{        
		if(app == "GVoice"){
			this.appurl = "http://google.com/voice/";
			this.$.LaunchApp.call({ "id": "com.ericblade.googlevoiceapp"});
		} else if(app == "Facebook"){
			this.appurl = "http://facebook.com/";
			this.$.LaunchApp.call({ "id": "com.palm.app.enyo-facebook"});
		}
	},
	GVoiceLaunched: function(inSender, inResponse)
	{
		this.log(inResponse);
		this.receive({ result: "ok" });
	},
	GVoiceFailed: function(inSender, inResponse)
	{
		this.log(inResponse);
		this.$.WebLauncher.call( { target: this.appurl });
		this.receive(); // null response == failure
	},
	webBrowserLaunched: function(inSender, inResponse)
	{
		this.log(inResponse);
		this.receive({ result: "ok" });
	},
	webBrowserFailed: function(inSender, inResponse)
	{
		this.log(inResponse);
		this.receive();
	}
});
