YAHOO.util.Event.addListener(window, 'load', init)

function init(){
	session = $H({});
	
	session['YahooAppId'] 	= 'LxUA0gjV34G8Ni31buGLFNefgsfkv3quGXhTd3CnT8YwHc4xu.05T.010oPiXjg61eZyMWx_';
	session['FlickrApiKey']	= 'f8507ebad8618853c451c88bbb057707';
	session['WeatherBugApiKey'] = 'A5666683667';
	session['CurrentRelease'] = '1.0';
	session['UpdateUrl'] = 'http://updates.travelmate.whizcreed.com/latest';
	
	Ajax.Responders.register({onCreate: function(){$('loading').show();}, onComplete: function(){$('loading').hide();}});

	//Assigning actions
	YAHOO.util.Event.addListener($("configProceed"), 'click', updateConfig);
	YAHOO.util.Event.addListener($("currencyCalc"), 'click', updateCurrency);	
	YAHOO.util.Event.addListener($("lnkPhoto"), 'click', showPhotos);
	YAHOO.util.Event.addListener($("lnkClock"), 'click', showClock);	
	YAHOO.util.Event.addListener($("lnkCurrency"), 'click', showCurrency);	
	YAHOO.util.Event.addListener($("lnkMap"), 'click', showMap);	
	YAHOO.util.Event.addListener($("lnkFlight"), 'click', showFlights);		
	YAHOO.util.Event.addListener($("lnkWeather"), 'click', showWeather);			
	
	YAHOO.util.Event.addListener($("tripBack"), 'change', function(){
							$F('tripBack') == 'n' ? $('tripReturnRow').show() : $('tripReturnRow').hide();
	});		
	YAHOO.util.Event.addListener($("tripProceed"), 'click', getFlights);
	
	
	//Window controls
	YAHOO.util.Event.addListener($("configBtn"), 'click', showConfig);

	setDatasources();
	setAutocompleters();
	setToolTips();
	
	//Calling setup method from other modules
	kayakSetup();
	setKayakSession();
	getRelease(); // Gets information from http://updates.travelmate.whizcreed.com/version.txt
	
	showConfig();
	$('loading').hide();
}

function setToolTips(){
	new YAHOO.widget.Tooltip('fromCityTip', {
							 context: ['fromCity','toCity'], 
							 text: 'Search by city name, airport name or airport code', 
							 hidedelay: 200,
							 autodismissdelay: 2000});	

	new YAHOO.widget.Tooltip('dateFormatTip', {
							 context: ['tripLeave','tripReturn'], 
							 text: 'MM/DD/YYYY', 
							 hidedelay: 200,
							 autodismissdelay: 1000});	

	new YAHOO.widget.Tooltip('logoTip', {
							 context: 'logo', 
							 text: 'Open official blog of Travel Mate', 
							 hidedelay: 200,
							 autodismissdelay: 2000});
	
}

function setDatasources(){
	// XHR DataSource for getting cities
	yahooDataSource = new YAHOO.widget.DS_XHR('http://travel.yahoo.com/common', ["\n"]); 
	yahooDataSource.responseType = YAHOO.widget.DS_XHR.TYPE_FLAT;
	yahooDataSource.queryMatchSubset = true;
	yahooDataSource.scriptQueryParam = "string";
	yahooDataSource.scriptQueryAppend = "action=qsauto&type=airport&mode=yuiflat&maxResults=20";
	
	// Javascript array datasource for getting currency list
	currencyDataSource = new YAHOO.widget.DS_JSArray(currencyList);
	currencyDataSource.queryMatchSubset = true;
}

function setAutocompleters(){
	var fromCityAC = new YAHOO.widget.AutoComplete($("fromCity"),YAHOO.util.Dom.get("fromCityOptions"), yahooDataSource);
	fromCityAC.animVert 			= false;
	fromCityAC.maxResultsDisplayed 	= 5;
	fromCityAC.minQueryLength 		= 2;
	fromCityAC.forceSelection 		= true;
	
	setLoadingEffect(fromCityAC);

	var toCityAC = new YAHOO.widget.AutoComplete($("toCity"),YAHOO.util.Dom.get("toCityOptions"), yahooDataSource);		
	toCityAC.animVert 			= false;
	toCityAC.maxResultsDisplayed 	= 5;
	toCityAC.minQueryLength 		= 2;
	toCityAC.forceSelection 		= true;
	
	setLoadingEffect(toCityAC);
	
	var fromCurrencyAC = new YAHOO.widget.AutoComplete($("fromCurrency"),YAHOO.util.Dom.get("fromCurrencyOptions"), currencyDataSource);		
	fromCurrencyAC.animVert 			= true;
	fromCurrencyAC.animSpeed 			= 0.5;
	fromCurrencyAC.maxResultsDisplayed 	= 5;
	fromCurrencyAC.minQueryLength 		= 1;
	fromCurrencyAC.forceSelection 		= true;
	
	var toCurrencyAC = new YAHOO.widget.AutoComplete($("toCurrency"),YAHOO.util.Dom.get("toCurrencyOptions"), currencyDataSource);		
	toCurrencyAC.animVert 				= true;
	toCurrencyAC.animSpeed 				= 0.5;
	toCurrencyAC.maxResultsDisplayed 	= 5;
	toCurrencyAC.minQueryLength 		= 1;
	toCurrencyAC.forceSelection 		= true;

}

function setLoadingEffect(obj){
	obj.dataRequestEvent.subscribe(function(){$("loading").show()});
	obj.dataReturnEvent.subscribe(function(){$("loading").hide()});
}