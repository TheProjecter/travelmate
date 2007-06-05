function getRelease(){
	var opts = {
		asynchronous: 'true',
		method: 'get',
		onSuccess: function(data){
			eval('var data =' + data.responseText);			
			if(parseFloat(session['CurrentRelease']) < parseFloat(data['ReleaseVersion'])){
				session['ReleaseUrl'] = data['ReleaseUrl'];
				session['ReleaseMessage'] = data['ReleaseMessage'];
				processRelease();
			}
		}
	};
	var url = session['UpdateUrl'] + '?random=' +Math.random();
	new Ajax.Request(url, opts);
}

function processRelease(){
	if(session['ReleaseUrl']){
		$('topLinks').innerHTML = '<a href=\''+ session['ReleaseUrl'] +'\' class=\'upgradeLink\'>' + session['ReleaseMessage'] + '</a>';
	}
}

function showConfig(){
	hideAll();
	$('bottomLinks').hide();
	$('config').show();
}

function updateConfig(){
	if($F('toCity') != '' && $F('fromCity') != ''){
		hideAll();
		$('idle').show();
		$('progress').show();
		$('bottomLinks').show();
	
		fromCity 	= $('fromCity').value;
		toCity 		= $('toCity').value;
		
		var rec  = fromCity.split(', ');
		session['fromCity'] = rec[0];
		rec = rec[1].split(' (');
		session['fromCountry'] = rec[0];
		if(rec.length > 1){session['fromAirport'] = rec[1].substring(0,3);}
		
		var rec  = toCity.split(', ');
		session['toCity'] = rec[0];
		rec = rec[1].split(' (');
		session['toCountry'] = rec[0];
		if(rec.length > 1){session['toAirport'] = rec[1].substring(0,3);}
		
		updateCords(); //geoAction
		flushData();
	}
}

function flushData(){
		var containers = [
						  	'photoThumbs', 'photoBig', 'mapContainer', 'clockFromCityName', 'clockFromCityTime', 'clockToCityName', 
							'clockToCityTime', 'flightGrid', 'weatherReport'
						 ];
		for(var i=0; i < containers.length; i++){
				$(containers[i]).innerHTML = '';
		}
		
		$('flightGrid').hide();
		$('flightForm').show();
		unselectAll();
}

function showPhotos(){
	hideAll();
	setSelected('lnkPhoto');
	$('photos').show();	
}

function loadPhotos(){
	url =  "http://api.flickr.com/services/rest/";
	url += "?method=flickr.photos.search&format=json&per_page=20&sort=interestingness-desc&&accuracy=11&nojsoncallback=1";
	url += "&tags=" + session['toCity'];
	url += "&api_key=" + session['FlickrApiKey'];
	new Ajax.Request(url,{onSuccess: function(data){
			eval('data ='+ data.responseText);
		
			var photoHTML = "<div id='photoThumbsDiv'>";
			for(var i=0;i < data.photos.photo.length;i++){
				var pic = data.photos.photo[i];
				photoHTML += "<div id='photoHolder'>"+ picThumb(pic) +"</div>";
			}
			photoHTML += "</div>";
			$('photoThumbs').innerHTML = photoHTML;
		}
	});
}

function picThumb(pic){
	pic_path = "http://farm"+ pic.farm +".static.flickr.com/"+ pic.server + "/" + pic.id +"_"+ pic.secret;
	thumb = "<img src='"+ pic_path +"_s.jpg' onClick='showPic(\""+ pic_path +"_m.jpg\")'>";
	return thumb;
}

function showPic(url){
	$('photoThumbs').hide();
	var pic = "<div id='photoBigDiv'><img src='"+ url +"' onClick=\"$('photoBig').hide();$('photoThumbs').show();\"></div>";
	$('photoBig').innerHTML = 	pic;
	$('photoBig').show();
}

function showClock(){
	hideAll();
	setSelected('lnkClock');
	$('clock').show();
	$('clockFromCityName').textContent = session['fromCity'];
	$('clockToCityName').textContent = session['toCity'];
}

function showCurrency(){
	hideAll();	
	setSelected('lnkCurrency');
	loadCurrencyOptions($('toCurrency'));
	loadCurrencyOptions($('fromCurrency'));	
	$('currency').show();
}

function updateCurrency(){
	var api = 'http://download.finance.yahoo.com/d/quotes.csv';
	var params = 's=' + $F('fromCurrency'); 
	params    += $F('toCurrency') + '=X&f=l1&e=.csv';
	
	var opts = {
		asynchronous: 'true',
		method: 'post',
		postBody: params,
		onSuccess: setCurrency
	};
	
	new Ajax.Request(api, opts);	

}

function setCurrency(data){
	data = data.responseText;
	var result = (parseFloat($('currencyAmount').value) * parseFloat(data));
	result = Math.round(result*100)/100; // Rounding off to two decimal places
	result = isNaN(result) ? 'Not Number' : result;
	$('currencyResult').innerHTML = ' = ' + result;
}

function showMap(){
	hideAll();
	setSelected('lnkMap');
	
	$('map').show();
	loadMap();
}

function showFlights(){
	hideAll();
	setSelected('lnkFlight');
	$('flights').show();
}

function showWeather(){
	hideAll();
	setSelected('lnkWeather');
	$('weather').show();	
}

function hideAll(){
	$('config', 'photos', 'clock', 'currency', 'map', 'flights', 'weather', 'idle', 'progress').invoke('hide');
	$('topLinks').innerHTML = '';
	processRelease();
}


function setSelected(wht){
	unselectAll();
	$(wht).addClassName('selectedLink');
}

function unselectAll(){
	$('lnkPhoto').removeClassName('selectedLink');
	$('lnkClock').removeClassName('selectedLink');
	$('lnkCurrency').removeClassName('selectedLink');
	$('lnkMap').removeClassName('selectedLink');
	$('lnkFlight').removeClassName('selectedLink');	
	$('lnkWeather').removeClassName('selectedLink');	
}

function strDuration(val){
	var num = parseInt(val);
	var m 	= (num % 60);
	num 	= (num - m);
	var h 	= (num / 60);
	
	return h + ' Hrs' + m + ' Mins';
}