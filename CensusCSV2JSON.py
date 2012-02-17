#!/usr/bin/env python

import sys
import pprint
import string
import csv
import json

filename = sys.argv[1]
#csvFile = open(filename, 'r')
csv = csv.reader(open(sys.argv[1], 'r'), delimiter=',', quotechar='"')


trade_data = {}

#header = csvFile.readline()
header = csv.next()
#print header

for parts in csv:
   #line = string.replace(line, "\r", "")
   #line = string.replace(line, "\n", "")
   #parts = line.split(',')
  

 
   # ignore non data lines by trying to read year
   year = None
   try:
      year = int(parts[0])
   except:
      year = None

   if year != None:
      # have a real data line
      if year not in trade_data:
         # have a new year
         trade_data[year] = {}
      country_name = parts[2]
      if country_name not in trade_data[year]:
         trade_data[year][country_name] = {}
     
 
      trade_data[year][country_name]['imports_by_month']   = parts[3:15]
      trade_data[year][country_name]['imports_year_total'] = parts[15]
      trade_data[year][country_name]['exports_by_month']   = parts[16:28]
      trade_data[year][country_name]['exports_year_total'] = parts[28]
      
      

# iterate through dict sorted by key (year)
it = iter(sorted(trade_data.iteritems()))
while True:
   year = None
   try:
      year = it.next()
   except StopIteration:
      break

   #print str(year[0]) + ': {}'

#pp = pprint.PrettyPrinter(indent=3)
#pp.pprint(trade_data)

print json.dumps(trade_data)

#json = str(trade_data[1985])
#json = string.replace(json, ' ', '')
#json = string.replace(json, "'", '"')
#print json
