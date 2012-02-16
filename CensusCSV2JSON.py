#!/usr/bin/env python

import sys
import pprint

filename = sys.argv[1]
csvFile = open(filename, 'r')

trade_data = {}

months_template = [
{'month_name': 'January',   'imports': {}, 'exports': {}},
{'month_name': 'February',  'imports': {}, 'exports': {}},
{'month_name': 'March',     'imports': {}, 'exports': {}},
{'month_name': 'April',     'imports': {}, 'exports': {}},
{'month_name': 'May',       'imports': {}, 'exports': {}},
{'month_name': 'June',      'imports': {}, 'exports': {}},
{'month_name': 'July',      'imports': {}, 'exports': {}},
{'month_name': 'August',    'imports': {}, 'exports': {}},
{'month_name': 'September', 'imports': {}, 'exports': {}},
{'month_name': 'October',   'imports': {}, 'exports': {}},
{'month_name': 'November',  'imports': {}, 'exports': {}},
{'month_name': 'December',  'imports': {}, 'exports': {}}
]

for line in csvFile:
   parts = line.split(',')
   
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
         trade_data[year] = months_template
      country_name = parts[2]
      if country_name not in trade_data[year][0]['imports']:
         for month_index in range(0, len(months_template)):
            trade_data[year][month_index]['imports'][country_name] = None
            trade_data[year][month_index]['exports'][country_name] = None


# iterate through dict sorted by key (year)
it = iter(sorted(trade_data.iteritems()))
while True:
   year = None
   try:
      year = it.next()
   except StopIteration:
      break

   print str(year[0]) + ': {}'

pp = pprint.PrettyPrinter(indent=3)
pp.pprint(trade_data)
