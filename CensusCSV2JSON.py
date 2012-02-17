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
not_geocodable = []

header = csv.next()
g = geopy.geocoders.Google()


def geocode(country_name):
   geocode_result = None
   try:
      geocode_result = g.geocode(country_name)
      place  = geocode_result[0]
      latLng = geocode_result[1]
      trade_data['countries'][country_name] = {'latLng': latLng}
      #sys.stderr.write("Geocoded " + country_name + "\n")
      return True
   except ValueError:
      sys.stderr.write("Could not geocode '"+country_name+"': "+str(geocode_result)+"\n")
      not_geocodable.append(country_name)
      return False
   except geopy.geocoders.google.GQueryError as e:
      sys.stderr.write(country_name + ": " + str(e) + "\n")
      not_geocodable.append(country_name)
   except geopy.geocoders.google.GTooManyQueriesError:
      time.sleep(1)
      return geocode(country_name)

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
      if country_name not in trade_data['countries'] and country_name not in not_geocodable:
         geocode(country_name)
           
      if country_name not in trade_data['trade'][year]:
         trade_data['trade'][year][country_name] = {}
     
 
      trade_data['trade'][year][country_name]['imports_by_month']   = parts[3:15]
      trade_data['trade'][year][country_name]['imports_year_total'] = parts[15]
      trade_data['trade'][year][country_name]['exports_by_month']   = parts[16:28]
      trade_data['trade'][year][country_name]['exports_year_total'] = parts[28]
     

#pp = pprint.PrettyPrinter(indent=3)
#pp.pprint(trade_data)
 
print json.dumps(trade_data)

sys.stderr.write("Couldn't geocode: " + str(not_geocodable) + "\n")
