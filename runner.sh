#!/bin/bash
# declare an array called array and define 3 vales
array=( BOS SFO LAX SEA FLL JFK DEN DFW ORD)
casperjs initialize.js
for i in "${array[@]}"
do
for j in "${array[@]}"
do	
if [ "$i" != "$j" ]
then
casperjs expediaScraper.js --arrival=$j --departure=$i --initial=5 --duration=10
echo $j $i
wait
fi
done
done
date >> timeLog.log
