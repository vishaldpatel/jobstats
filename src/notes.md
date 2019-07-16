Problem:
- If we're going to scrape all that data, then
  it is probably a good idea to store it on the server,
  so we don't keep hammering the API.

- Since the amount of data can get sizeable, the frontend
  should probably only get enough data that it needs for
  displaying:
  - Menu items.
  - Current results.
  - Data for charts.


So, what will our backend do?
- Populate the database
- Provide an API for:
  - Creating filters
- Calculate results for filters
- Requesting a resultset of enabled filters

This leaves the front-end to:
- Display results
- Display sources
- Display filters
- Allow creation of new filters, which the backend will then sift through the data
  to provide an array if IDs to the front-end.
- Calculate results from enabled filters and sources,
  request results for missing jobs.
  

... or maybe not.
- Grab all historical posts from HN.
- Add them to JSON files on the server.
- Lazy load them as needed.