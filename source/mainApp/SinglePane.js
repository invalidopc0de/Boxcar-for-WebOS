enyo.kind({
	name: "SinglePane",
	kind: enyo.VFlexBox,
	components: [
		{kind: "Popup", components: [
			{content: "Login Successful!"},
			{kind: "Button", caption: "Close", onclick: "popupClose"}
		]},
		{content: "Welcome to Boxcar for webOS"},
		{kind: "Input", name: "username", hint: "Username", alwaysLooksFocused: "true", autocorrect: "false",
			spellcheck: "false", autoCapitalize: "lowercase", inputType: "email"},
		{kind: "PasswordInput", name: "password", hint: "Password", alwaysLooksFocused: "true"},
		{kind: "ActivityButton", name: "loginButton", caption: "Login", className: "enyo-button-affirmative",
			onclick: "loginClick", active: false}
	],
	
	popupClose: function() {
		this.$.popup.close();
	},
	
	loginClick: function() {
		this.$.loginButton.setDisabled(true);
		this.$.loginButton.setActive(true);
		enyo.application.securePrefs['access_token'] = "";
		enyo.application.securePrefs['password'] = this.$.password.getValue();
		enyo.application.securePrefs['username'] = this.$.username.getValue();
		enyo.windows.getRootWindow().launcher.getStatus();
	},
	
	openPopup: function() {
		this.$.popup.openAtCenter();
	}
	
});