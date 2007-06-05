// JavaScript Document

function updateCords(){
	var api =  "http://local.yahooapis.com/MapsService/V1/geocode?appid=" + session['YahooAppId'];

	var url = api + "&location=" + session['toCity'] + ' ' + session['toCountry']
	new Ajax.Request(url, {onSuccess: setToCityCords});

	var url = api + "&location=" + session['fromCity'] + ' ' + session['fromCountry']

	new Ajax.Request(url, {onSuccess: setFromCityCords});
}

function setToCityCords(data){
	data = data.responseXML;
	session['toLatitude']  = data.getElementsByTagName('Latitude')[0].textContent; 
	session['toLongitude'] = data.getElementsByTagName('Longitude')[0].textContent;
	loadMap();
	updateTimezone();
	loadPhotos();
	getWeather();
}

function setFromCityCords(data){
	data = data.responseXML;
	session['fromLatitude']  = data.getElementsByTagName('Latitude')[0].textContent; 
	session['fromLongitude'] = data.getElementsByTagName('Longitude')[0].textContent;
	updateTimezone();
}

function updateTimezone(){
	api = "http://www.earthtools.org/timezone-1.1/";
	if(session['toLatitude'] && session['toLongitude']){
		var url = api + session['toLatitude'] + '/' + session['toLongitude'];
		new Ajax.Request(url, {
								onSuccess: function(data){
									data = data.responseXML;
									session['toOffset'] = data.getElementsByTagName('offset')[0].textContent;
									session['toDst'] 	= data.getElementsByTagName('dst')[0].textContent;							

									session['timeDiff'] = session['toOffset']
									
									var clock = $('clockToCityTime');									
									new PeriodicalExecuter(function(){
														setClock(clock, session['toOffset'], session['toDst']);
									}, 1);
								}
							});
	}

	if(session['fromLatitude'] && session['fromLongitude']){
		var url = api + session['fromLatitude'] + '/' + session['fromLongitude'];
		new Ajax.Request(url, {
								onSuccess: function(data){
									data = data.responseXML;
									session['fromOffset'] = data.getElementsByTagName('offset')[0].textContent;
									session['fromDst'] 	= data.getElementsByTagName('dst')[0].textContent;
									var clock = $('clockFromCityTime');
									new PeriodicalExecuter(function(){
														setClock(clock, session['fromOffset'], session['fromDst']);
									}, 1);
								}
							});
	}
}

// function to calculate local time
// in a different city
// given the city's UTC offset
// http://builder.com.com/5100-6370-6016329.html
function setClock(obj, offset, dst) {
    d = new Date();
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
   	dst = (dst == 'True' ? 3600000 : 0); // Added support for DST
    nd = new Date(utc + (3600000*offset) + dst);
    
    // return time as a string
    obj.innerHTML = nd.toLocaleString();
}

function loadMap(){
	if(session['toLatitude'] != '' &&  session['toLongitude'] != ''){
	  $("mapContainer").innerHTML = '';
	  if (GBrowserIsCompatible()) {
	 	GUnload();
        var map = new GMap($("mapContainer"), {draggableCursor: 'default', draggingCursor: 'default'});
		var point = new GLatLng(session['toLatitude'], session['toLongitude']);
        map.setCenter(point, 13);
//		map.addControl(new GSmallZoomControl()); //This adds just the zoom controls + / -
		map.addControl(new GSmallMapControl());
		var marker = new GMarker(point);
        map.addOverlay(marker);
      }
	}
}

function getWeather(){
	var api  = 'http://api.wxbug.net/getLiveWeatherRSS.aspx';
	var url  = api + '?ACode='+ session['WeatherBugApiKey'];
	url 	+= '&lat=' + session['toLatitude'] + '&long=' + session['toLongitude'];
	new Ajax.Request(url,
								{onSuccess: function(data){
										data = data.responseXML;
										var report = data.getElementsByTagName('item')[0]
										$('weatherReport').innerHTML = report.getElementsByTagName('description')[0].textContent;
										$('progress').hide();
									}
								});
}