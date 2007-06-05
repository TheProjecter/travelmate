// JavaScript Document
function kayakSetup(){
	session['KayakBase'] 		= 'http://www.kayak.com';
	session['KayakSessionApi'] 	= '/k/ident/apisession';
	session['KayakSearchApi'] 	= '/s/apisearch';
	session['KayakResultApi'] 	= '/s/apibasic/flight';
	session['KayakApiKey']	  	= '8VSjGSqKVgr_x7_k8h2b_g';
}

function getFlights(){
	var oneWay = $F('tripBack') != 'n' ? 'y' : 'n';
	data  = 'basicmode=true&action=doFlights&apimode=1&version=1&_sid_='+ session['KayakSessionId'];
	data += '&oneway='+oneWay+'&origin='+session['fromAirport']+'&destination='+session['toAirport']+'&depart_date='+$F('tripLeave');
	data += '&return_date='+ $F('tripReturn') +'&depart_time='+ $F('tripLeaveTime') + '&return_time='+ $F('tripReturnTime');
	data += '&travelers='+ $F('tripTravelers') +'&cabin='+ $F('tripCabin');
	$('flights').hide();
	$('idle').show();
	$('progress').show();
	$('topLinks').innerHTML = '';

	requestFlights(data);
}

function setKayakSession(data, callback){
	if(!data){
		callback = function(){};
		data = '';
	}

	var opts = {
		asynchronous: 'true',
		method: 'post',
		postBody: 'token=' + session['KayakApiKey'] + '&version=1',
		onSuccess: function(response){
			session['KayakSessionId'] = response.responseXML.getElementsByTagName('sid')[0].textContent;
			session['KayakSessionStamp'] = new Date();
			callback(data);
		}
	};
	
	
	new Ajax.Request(session['KayakBase'] + session['KayakSessionApi'], opts);
}

function requestFlights(data){
	var now = new Date();
	if((now - session['KayakSessionStamp']) >= 1800000){
		setKayakSession(data, function(d){requestFlights(d)});
	}else{
	
		var opts = {
			asynchronous: 'true',
			method: 'post',
			postBody: data,
			onSuccess: function(response,callback){
				if(response.responseXML.getElementsByTagName('searchid').length > 0){
					var search_id = response.responseXML.getElementsByTagName('searchid')[0].textContent;
					loadFlights(search_id);
				}else{
					$('topLinks').innerHTML = 'Error: Unable to get results.. please try again';
					$('idle').hide();
					$('progress').hide();
					$('flights').show();
				}
			}
		};

		var url = session['KayakBase'] + session['KayakSearchApi'];
		new Ajax.Request(url, opts);
	}
}

function loadFlights(search_id){
	var data = 'apimode=1&version=1&searchid=' + search_id + '&_sid_=' + session['KayakSessionId'] + '&c=20';
	var url = session['KayakBase'] + session['KayakResultApi'] + '?' + data;

	
	var opts = {
				asynchronous: true,
				methid: 'get',
				onSuccess: processFlights
	           };
			   
	new Ajax.Request(url, opts);
}

function processFlights(data){
	data = data.responseXML;
	
	session['flights'] = new Array;
	
	var trips = data.getElementsByTagName('trip');
	for(var i=0; i < trips.length ; i++){
		var price = trips[i].getElementsByTagName('price')[0].textContent;
		var bookUrl = trips[i].getElementsByTagName('price')[0].getAttribute('url');
        
		var records = trips[i].getElementsByTagName('leg');
		for(var x=0; x < records.length; x++){
			var rec = {};
			var record		= records[x];
			rec['airline']  = record.getElementsByTagName('airline')[0].textContent;
			rec['trip']     = record.getElementsByTagName('orig'   )[0].textContent + ' >> ' +record.getElementsByTagName('dest')[0].textContent;
			rec['depart']   = new Date(record.getElementsByTagName('depart' )[0].textContent);
			rec['arrive']   = new Date(record.getElementsByTagName('arrive' )[0].textContent);
			rec['stops']    = record.getElementsByTagName('stops'  )[0].textContent;
			rec['duration'] 	  = strDuration(record.getElementsByTagName('duration_minutes')[0].textContent);
			rec['airline_text']   = record.getElementsByTagName('airline_display')[0].textContent;
			
			rec['price'] = price;
			rec['book']  = bookUrl;
			
			session['flights'][session['flights'].length] = rec;
		}
	}
	
	if(data.getElementsByTagName('morepending')[0].textContent == 'true'){
		loadFlights(data.getElementsByTagName('searchid')[0].textContent);
	}else{
		loadFlightGrid();	
	}
}

function loadFlightGrid(){
	var bookingUrlFormat = function(elCell, oRecord, oColumn, sData) {
	    elCell.innerHTML = "<a href='" + session['KayakBase'] + oRecord.book + "'>" + sData + "</a>";
	};
	
	var flightDataSource = new YAHOO.util.DataSource(session['flights']);
	flightDataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
	flightDataSource.responseSchema = {
		fields: ['airline_text', 'price', 'trip', 'depart', 'arrive', 'stops', 'duration', 'book']
	};
	
	var flightColumnHeaders = [
		{key:"airline_text", text:"Airline", sortable:true, resizeable:true},
		{key:"price", text:"USD", sortable:true, resizeable:true, formatter: bookingUrlFormat},
		{key:"trip", text:"Airports", sortable:true, resizeable:true},
		{key:"depart", text:"Depart", type: 'date', sortable:true, resizeable:true},
		{key:"arrive", text:"Arrive", type: 'date', sortable:true, resizeable:true},
		{key:"stops", text:"Stops",type: 'number', sortable:true, resizeable:true},
		{key:"duration", text:"Duration", sortable:true, resizeable:true}
	];
	
	var flightColumnSet = new YAHOO.widget.ColumnSet(flightColumnHeaders);
	var flightDataTable = new YAHOO.widget.DataTable("flightGrid", flightColumnSet, flightDataSource);
	$('idle').hide();
	$('progress').hide();
	$('flightForm').hide();
	$('flightGrid').show();
	$('flights').show();
}