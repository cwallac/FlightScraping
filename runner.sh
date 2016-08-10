#!/bin/bash
# declare an array called array and define 3 vales
echo "WORKING" >> /tmp/testing
array=( BOS SFO LAX SEA FLL JFK DEN DFW ORD)
echo "INITIALIZING" >> start.log
casperjs /home/ec2-user/FlightScrape/initialize.js
echo "BEGIN" >> afterinit.log
for i in "${array[@]}"
do
for j in "${array[@]}"
do	
if [ "$i" != "$j" ]
then
echo "LOOP" >> mid.log
casperjs /home/ec2-user/FlightScrape/expediaScraper.js --arrival=$j --departure=$i --initial=5 --duration=140 
echo $j $i
wait
fi
done
done
date >> /home/ec2-user/FlightScrape/timeLog.log
