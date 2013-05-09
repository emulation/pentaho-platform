/*
 * ******************************************************************************
 * Pentaho
 *
 * Copyright (C) 2002-2013 by Pentaho : http://www.pentaho.com
 * ******************************************************************************
 */

pen.define([
	"common-ui/util/BootstrappedTabLoader",
	"common-ui/util/ContextProvider"
], function(BootstrappedTabLoader, ContextProvider) {

	function init() {
		var urlVars = getUrlVars();
		//selectedContentIndex

		var prevTab;

		BootstrappedTabLoader.init({
			parentSelector: "#launch-widget",
			tabContentPattern : "launch_tab{{contentNumber}}_content.html",
			defaultTabSelector : "#"+urlVars.selectedTab,
			before: function() { 
				ContextProvider.get(function(context) {
					// Generate samples array descriptions
			 		var samplesArray = new Array();
			 		for (var i = 1; i <= 9; i++) {
			 			samplesArray.push({
			 				title: context.i18n["getting_started_sample" + i],
			 				description : context.i18n["getting_started_sample" + i + "_description"]
			 			});
			 		}
			 		ContextProvider.addProperty("getting_started_samples", samplesArray);

			 		// Generate turorials array descriptions
			 		var tutorialsArray = new Array();
			 		for (var i = 1; i <=5; i++) {
			 			tutorialsArray.push({
			 				title: context.i18n["getting_started_video" + i],
			 				description: context.i18n["getting_started_video" + i + "_description"]
			 			});
			 		}
			 		ContextProvider.addProperty("getting_started_tutorials", tutorialsArray);
		 		});
			}, postLoad: function(jHtml, tabSelector) {
				var tabId = $(tabSelector).attr("id");

				if (tabId == "tab2") {
					bindCardInteractions(jHtml, ".sample-card", (urlVars.selectedTab == "tab2" ? urlVars.selectedContentIndex : 0), function(card) {
						var cardIndex = jHtml.find(".sample-card").index(card);

						// TODO - LOAD SAMPLE
						jHtml.find("#sample").text(cardIndex);
					});

				} else if (tabId == "tab3") {
					pen.require(["home/gettingStarted"], function(GettingStartedWidget) {
						ContextProvider.get(function(context) {
							jHtml.find(".tutorial-card").each(function(index) {
								var youtubeLinkId = context.config["tutorial_link"+(index+1)+"_id"];
								GettingStartedWidget.injectYoutubeVideoDuration(youtubeLinkId, $(this), ".tutorial-card-time");
							});
						});
					})

					// Bind click interactions
					bindCardInteractions(jHtml, ".tutorial-card", (urlVars.selectedTab == "tab3" ? urlVars.selectedContentIndex : 0), function(card) {
						ContextProvider.get(function(context) {

							// Update video
							var cardIndex = jHtml.find(".tutorial-card").index(card);
							try{
							$("#tutorial-video").attr("src", context.config.youtube_embed_base + context.config["tutorial_link" + (cardIndex+1) + "_id"] + "?autoplay=1");
							} catch (err) {
						alert(err);
					}

							// Copy title and description
							jHtml.find(".detail-title").text(card.find(".card-title").text());
							jHtml.find(".detail-description").text(card.find(".card-description").text());
						})						
					});
				}
				
			}, postClick: function(tabSelector) {
				var tabId = $(tabSelector).attr("id");

				// Re-populate welcome video src link
				if (tabId == "tab1") {
					ContextProvider.get(function(context) {
						$("#welcome-video").attr("src", context.config.youtube_embed_base + context.config.welcome_link_id + "?autoplay=1");
					});
				}

				// Re-populate tutorial video src link
				if (tabId == "tab3") {
					ContextProvider.get(function(context) {
						var selectedCard = $(".tutorial-card.selected");
						var cardIndex = $(".tutorial-card").index(selectedCard);
						$("#tutorial-video").attr("src", context.config.youtube_embed_base + context.config["tutorial_link" + (cardIndex+1) + "_id"] + "?autoplay=1")
					})
				}
				
				// Clear source of welcome video to comply with tab switching
				if (prevTab == "tab1" && tabId != "tab1") {
					try{
						$("#welcome-video").attr("src", "");
					} catch (err) {
						alert(err);
					}
										
				}

				// Clear source of tutorial video to comply with tab switching
				if (prevTab == "tab3" && tabId != "tab3") {					
					$("#tutorial-video").attr("src", "");					
				}

				prevTab = tabId;
			}
		});		
	}

	/**
	 * Provides the click interactions for "cards" on page
	 */
	function bindCardInteractions(jParent, cardSelector, defaultSelectedIndex, post) {

		var cards = jParent.find(cardSelector);

		cards.bind("click", function() {
			var card = $(this);

			// Clear selected cards
			jParent.find(".selected").removeClass("selected");
			card.addClass("selected");

			if (post) {
				post(card);
			}
		});

		cards.eq(defaultSelectedIndex).click();
	}

	/**
	 * Retrieves the url variables and places them into a JSON
	 */
	function getUrlVars()
	{
	    var vars = {}, hash;
	    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	    for(var i = 0; i < hashes.length; i++)
	    {
	        hash = hashes[i].split('=');
	        vars[hash[0]] = hash[1];
	    }
	    return vars;
	}

	return {
		init:init
	};
});