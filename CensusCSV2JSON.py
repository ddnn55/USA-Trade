#!/usr/bin/env python

import sys

filename = sys.argv[1]
csvFile = open(filename, 'r')

trade_data = {}

for line in csvFile:
   parts = line.split(',')
   year = parts[0]
   if year not in trade_data:
      trade_data[year] = {}

print trade_data
