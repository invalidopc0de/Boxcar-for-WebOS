enyo.kind({
	name: "SinglePane",
	kind: enyo.VFlexBox,
	components: [
		{content: "Welcome to Boxcar for webOS"},
		{kind: "Input", name: "username", hint: "Username", alwaysLooksFocused: "true", autocorrect: "false",
			spellcheck: "false", autoCapitalize: "lowercase", inputType: "email"},
		{kind: "PasswordInput", name: "password", hint: "Password", alwaysLooksFocused: "true"},
		{kind: "Button", caption: "Login", className: "enyo-button-affirmative", onclick: "loginClick"}
	],
	
	loginClick: function() {
		enyo.application.securePrefs['access_token'] = "";
		enyo.application.securePrefs['password'] = this.$.password.getValue();
		enyo.application.securePrefs['username'] = this.$.username.getValue();
		enyo.windows.getRootWindow().launcher.getStatus();
	}
	
});