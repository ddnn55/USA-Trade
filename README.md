About
-----
Google Maps based visualization of United States imports and exports by partner country from 1985 to 2011, based on data from the United States Census Bureau.

Data from http://www.census.gov/foreign-trade/statistics/country/

Usage
-----
First, you need the geopy Python module. Install it like so (requires http://pypi.python.org/pypi/virtualenv):

    source CreatePythonVirtualEnv.sh

Convert US Census trade CSV to JSON, and geocode countries with Google (slow because of geocode API rate limit):

    ./CensusCSV2JSON.py usa_trade_data/COUNTRY-Table\ 1.csv > www/usa_trade_data.js

Preview locally:

    cd www; python -m SimpleHTTPServer

Future / TODO
-------------

Content:
* Add deficit only mode
* Add links to deeper information per country (i.e. 'site:census.gov/foreign-trade/statistics/ nigeria' google queries, or some other data source, etc.)
* Add monthly data
* Summarize yearly totals in timeline
* Change name from "USA Trade" to "International Trade" and add more data:
  - Top imports and exports by origin and destination country: http://www.wto.org/english/res_e/statis_e/statis_e.htm
  - USA International Imports and Exports by US State (Alabama, Arkansas, ...) and origin/destination country: http://www.census.gov/foreign-trade/statistics/state/

System:
* usa_trade_data.js is a big slow download.
  - Add loading spinner
  - Store data more efficiently in JSON (e.g. don't repeat country names a million times)
* Add play/pause button
* Change graphics to canvas / WebGL because Google Maps Drawing API is slooooow for all this data. (or cull, etc...)

