#!/usr/bin/env python

import sys
import pprint
import string
import csv
import json
import geopy
import time

filename = sys.argv[1]
csv = csv.reader(open(sys.argv[1], 'r'), delimiter=',', quotechar='"')

trade_data = { 'countries': {}, 'trade': {} }
could_not_geocode = []

header = csv.next()
g = geopy.geocoders.Google()

# geocoder is failing on the following countries. doing them by hand.
manual_geocodes = {
'Mexico': [22.593726,-101.777344],
'Jamaica': [18.156291,-77.294312],
'Grenada': [12.118551,-61.680679],
'Sint Maarten': [18.083854,-63.052597],
'Svalbard, Jan Mayen Island': [71.008023,-8.421021],
'Georgia': [42.098222,43.395996],
'Gibraltar': [36.13427,-5.347767],
'San Marino': [43.938945,12.463303],
'Yugoslavia (fomer)': [43.850374,19.6875],
'Serbia and Montenegro': [43.084937,19.907227],
'Greece': [39.690281,21.75293],
'Lebanon': [33.95703,35.831909],
'Gaza Strip admin. by Israel': [31.422804,34.367981],
'West Bank admin. by Israel': [31.959153,35.326538],
'Iraq-Saudi Arabia Neutral Zone': [29.152161,45.725098],
'Australia': [-25.324167,135.175781],
'Congo (Brazzaville)': [-4.255345,15.24559],
'Congo (Kinshasa)': [-4.395706,15.305328],
'British Indian Ocean Terr.': [-7.318201,72.423248],
'French Southern and Antarctic': [-49.296472,69.499512]
}

def geocode(country_name, country_code):
   geocode_result = None
   try:
      geocode_result = g.geocode(country_name)
      place  = geocode_result[0]
      latLng = geocode_result[1]
      trade_data['countries'][country_name] = {'latLng': latLng, 'country_code': country_code}
      sys.stderr.write("Geocoded " + country_name + " with Google\n")
      return True
   except (ValueError, geopy.geocoders.google.GQueryError):
      try:
         latLng = manual_geocodes[country_name]
         trade_data['countries'][country_name] = {'latLng': [str(latLng[0]), str(latLng[1])], 'country_code': country_code}
         sys.stderr.write("Used manual geocode for " + country_name + " (Google couldn't geocode)\n")
            
         return True
      except KeyError:
         could_not_geocode.append(country_name)
   #   sys.stderr.write("Could not geocode '"+country_name+"': "+str(geocode_result)+"\n")
   #   not_geocodable.append(country_name)
   #   return False
   #except geopy.geocoders.google.GQueryError as e:
   #   sys.stderr.write(country_name + ": " + str(e) + "\n")
   #   not_geocodable.append(country_name)
   except geopy.geocoders.google.GTooManyQueriesError:
      sys.stderr.write("Exceeded Google query rate limit, sleeping for 1 second\n")
      time.sleep(1)
      return geocode(country_name, country_code)

for parts in csv:
   # ignore non data lines by trying to read year
   year = None
   try:
      year = int(parts[0])
   except:
      year = None

   if year != None:
      # have a real data line
      if year not in trade_data['trade']:
         # have a new year
         trade_data['trade'][year] = {}
      country_name = parts[2]
      country_code = parts[1]
      if country_name not in trade_data['countries'] and country_name not in could_not_geocode:
         geocode(country_name, country_code)
           
      if country_name not in trade_data['trade'][year]:
         trade_data['trade'][year][country_name] = {}
     
 
      #trade_data['trade'][year][country_name]['imports_by_month']   = parts[3:15]
      trade_data['trade'][year][country_name]['imports_year_total'] = parts[15]
      #trade_data['trade'][year][country_name]['exports_by_month']   = parts[16:28]
      trade_data['trade'][year][country_name]['exports_year_total'] = parts[28]
     

#pp = pprint.PrettyPrinter(indent=3)
#pp.pprint(trade_data)
 
print json.dumps(trade_data)

sys.stderr.write("\n\n------------------\n\nCouldn't geocode: " + str(could_not_geocode) + "\n")
