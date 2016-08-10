Date.prototype.yyyymmdd = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return  (mm[1]?mm:"0"+mm[0]) + "/" + (dd[1]?dd:"0"+dd[0]) + "/" + yyyy; // padding
  };

  Date.prototype.fileName = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return  (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]) + "-" + yyyy; // padding
  };

  Date.prototype.addDays = function(days)
{
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

function convertDurationToMinutes(duration) {
	var hours;
	if (isNaN(duration.substring(0,2))) {
		hours = parseInt(duration.substring(0,1));
	} else {
		hours = parseInt(duration.substring(0,2));
	}

	var minutes;
	if (isNaN(duration.substring(duration.length-3, duration.length-1))) {
		minutes = parseInt(duration.substring(duration.length-2, duration.length-1));
	} else {
		minutes = parseInt(duration.substring(duration.length-3, duration.length-1));
	}

	return minutes + hours*60;
}

function calcDiffDays(date1, date2) {
	var oneDay = 24*60*60*1000;
	return Math.round(Math.abs((date1.getTime() - date2.getTime())/(oneDay)));
}



//Javscript scope is weird
function createFlightScrape(departure_city, arrival_city, date, filename) {
	return function() {
	
	//Miscellaneous date things
	var today = new Date();
	var flightDate = new Date(date);
	var todayTest = new Date(today);
	
	//Collect static variables
	var preFix = "https://www.expedia.com/Flights-Search?trip=oneway&leg1=from:";
	var postFix = "TANYT&passengers=children:0,adults:1,seniors:0,infantinlap:Y&mode=search";
	var diffDays = calcDiffDays(todayTest, flightDate) + 1;
	var baseString = departure_city + "," + arrival_city + "," + flightDate.yyyymmdd() + "," + diffDays + ",";
	casper.thenOpen(preFix + departure_city + ",to:" + arrival_city + ",departure:" + date + postFix, function() {
		this.waitForSelector("#bCol", function() {
			this.wait(250);
			var airlineList = this.getElementsInfo(".secondary");
			var airlineAtrributeList = this.getElementsAttribute(".secondary", "data-test-id");
			var departureTime = this.getElementsInfo(".departure-time");
			var airlinerList = [];
			var durationList = [];
			var departureList = []
			var durationHtmlList = this.getElementsInfo(".primary");
			var durationAttributeList = this.getElementsAttribute(".primary","data-test-id");
			
			var priceList = this.getElementsAttribute(".price-column", "data-test-price-per-traveler");
			//this.echo(priceList);
			for (var j = 0; j < airlineAtrributeList.length; j++) {
				if (airlineAtrributeList[j] == "airline-name") {
					airlinerList.push(airlineList[j].html);

				}
				
			}
			for (var k = 0; k < durationHtmlList.length; k++) {
				if (durationAttributeList[k] == "duration") {
					durationList.push(durationHtmlList[k].html);
					

				}
			}
			for (var i = 0; i < airlinerList.length; i++) {
				var price = priceList[i].substring(1);
				var departure = departureTime[i].html;
				var duration = convertDurationToMinutes(durationList[i].trim());
				
				var airline = airlinerList[i].trim();
				//PRICE, AIRLINE, DURATION, DEPARTURE_TIME
				var variableString = price + "," + airline + "," + duration + "," + departure + "\n";
				//casper.echo(baseString + variableString);
				fs.write("/home/ec2-user/FlightScrape/testing" + filename + ".csv", baseString + variableString,"w+");
			}
			casper.echo("One collected");
			//this.wait(500);


		});

	});
};
};

var casper = require('casper').create({
    clientScripts: ["./jquery-1.11.3.js"],
    verbose: false,
    logLevel: "warn",
    waitTimeout: 10000,
    pageSettings: {
        loadImages:  false,        // The WebPage instance used by Casper will
        loadPlugins: false         // use these settings
    }
});

var fs = require('fs');
var utils = require('utils');


casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X)');
casper.options.viewportSize = {width: 900, height: 600};

var majorPorts = ["BOS", "SFO", "LAX", "JFK", "DEN", "SEA", "FLL" , "DFW", "ORD"];
majorPorts  = ["BOS", "SFO", "LAX","SEA", "FLL"];

casper.start(function() {
	this.echo("Starting");
});

casper.on('error', function(msg,backtrace) {
  this.capture('error.png');
});


var depart = casper.cli.get("departure");
var arrival = casper.cli.get("arrival");
var start = casper.cli.get("initial");
var numToRun = casper.cli.get("duration");
var funcs = [];

var today = new Date();
today.setHours(1);

casper.then(function(){
	this.echo("start");

	//Build the functions so that iterative values remain on the call.
	for (var m = start; m < start + numToRun; m++) {
		funcs.push(createFlightScrape(depart, arrival, today.addDays(m).yyyymmdd(), today.fileName()));
	}
	this.echo("Beginning to run functions");
	this.echo(new Date().getTime());
	//Actually run the functions, creating a giant stack of casperJs events.
	for (var i = 0; i < funcs.length; i++) {
		funcs[i]();
	}
	});




casper.run(function() {
	this.echo(new Date().getTime());
    this.echo('Done.').exit();

});
