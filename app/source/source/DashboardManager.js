enyo.kind({
	name: "DashboardManager",
	kind: enyo.Component,
	components: [{
	}],
	
	
	
        create: function () {
		this.inherited(arguments);
		
		enyo.application.messageIcons = {
			GoogleVoice: "images/google_voice_512_normal_48.png",
			EmailAccount: "images/inboxWood_normal_48.png",
			Facebook: "images/facebook_icon_512_normal_48.png",
			Other: "images/all_messages.png"
		};
		
		enyo.application.messageIconsSmall = {
			GoogleVoice: "images/google_voice_small.png",
			EmailAccount: "images/inboxWood_smal.png",
			Facebook: "images/facebook_icon_small.png",
			Other: "images/all_messages_small.png"
		};
                
                this.serviceDashboards = {};
        },
        
        displayMessage: function(messageData){
		var messageIcon = "";
		var messageIconSmall = "";
		if(messageData['provider_name'] == "Google Voice"){
			messageIcon = enyo.application.messageIcons['GoogleVoice'];
			messageIconSmall = enyo.application.messageIconsSmall['GoogleVoice'];
		} else if(messageData['provider_name'] == "Email Account"){
			messageIcon = enyo.application.messageIcons['EmailAccount'];
			messageIconSmall = enyo.application.messageIconsSmall['EmailAccount'];
		} else if(messageData['provider_name'] == "Facebook Account"){
			messageIcon = enyo.application.messageIcons['Facebook'];
			messageIconSmall = enyo.application.messageIconsSmall['Facebook'];
		} else {
			//messageIcon = messageData['icon'];
			messageIcon = enyo.application.messageIcons['Other'];
			messageIconSmall = enyo.application.messageIconsSmall['Other'];
		}
	
		enyo.windows.addBannerMessage(messageData['from_screen_name'] + " - " + messageData['message'], '{}', messageIconSmall, 'defaultapp', 'default');

		var serviceId = messageData['service_id']; var
		serviceDashboard = this.serviceDashboards[messageData['service_id']];
		// Update the dashboard content:
		if (!serviceDashboard) {
			serviceDashboard = this.createComponent({
				name: "dashboard-" + serviceId, kind:
				"enyo.Dashboard", serviceId: serviceId,
				onDashboardActivated:
				"dashboardActivated", onIconTap:
				"iconTap", onMessageTap: "messageTap",
				onUserClose: "dashboardClose",
				onLayerSwipe: "layerSwiped", smallIcon:
				messageIconSmall
			}); this.serviceDashboards[serviceId] =
			serviceDashboard;
		}
		
		serviceDashboard.push({icon: messageIcon,
					title:messageData['from_screen_name'],
					text:messageData['message']});
        }
});