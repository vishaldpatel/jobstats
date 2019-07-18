In order to run this, clone / download the repository. CD into the directory and run:
> npm install
> yarn start

If your web browser doesn't already open, then go to http://localhost:3000/ and the app
will begin to load. It takes some time initially, but then you should be able to filter
with ease.

7/18/2019:
  The new direction is good.
  We're going to download all the job posts and store them as static json files on server.
  The client will then load up the json files lazily and apply users' filters on them
  as well as prepare any analytics.

  First load is a bit slow right now, which will probably become an issue soon enough.

7/16/2019:
Problem:
  Execute a function after a function
  that runs on an array has completed on the last
  element of the array... such as downloading data from the last URL.

  While you're at it, only begin processing the next item, when the previous item has completed.
  
My new favorite solution (thank you, Elixir):
  Use recursion.
  Call processing function on the whole array.
  In the function, pop an element off, do the processing.
  Recursively call the same function with whats left of the array.
  And finally, when there are no more elements left (the passed in array is empty), either resolve the promise or run the callback funtion!

  This also makes it much easier to write functions that process data as promises.

--------------------------------------

7/15/2019:
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

