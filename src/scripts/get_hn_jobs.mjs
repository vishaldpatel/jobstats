import JobDownloader from '../lib/JobDownloader.mjs';

let jobSources = {
  // name : id
  // '2019 - June': 20083795,
  // '2019 - May': 19797594,
  // '2019 - April': 19543940,
  // '2019 - March': 19281834,
  // '2019 - February': 19055166,
  //'2019 - January': 18807017
}

// Implementing a queue so that we don't
// hammer the HN API.
let getNextSourceFrom = function(keys) {
  let key = keys.pop();
  if (typeof(key) !== 'undefined') {
    console.log(`\n\nGetting: ${key}`);
    let jobDownloader = new JobDownloader();
    jobDownloader.addJobSource(`https://news.ycombinator.com/item?id=${jobSources[key]}`)
    .then(() => jobDownloader.getMissingJobs())
    .then(() => {
      jobDownloader.saveTo(`data/${key}.json`);
      getNextSourceFrom(keys);
    })
  }
};

getNextSourceFrom(Object.keys(jobSources));