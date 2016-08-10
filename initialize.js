  Date.prototype.fileName = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return  (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]) + "-" + yyyy; // padding
  };

  var fs = require('fs');

  var today = new Date();

  var casper = require('casper').create({
    verbose: false,
    logLevel: "warn",
    waitTimeout: 10000,
    pageSettings: {
        loadImages:  false,        // The WebPage instance used by Casper will
        loadPlugins: false         // use these settings
    }
});

casper.start(function() {
	this.echo(casper.cli.get("test"));
	this.echo("Starting");



});

casper.then(function() {
fs.write("/home/ec2-user/FlightScrape/testing" + today.fileName() + ".csv", "DEPARTURE_CITY, ARRIVAL_CITY, DATE, DAYS_UNTIL_FLIGHT, PRICE, AIRLINE, DURATION, DEPARTURE_TIME \n", 'w');

});


casper.run(function() {
	this.echo('File Initialized').exit();

});
