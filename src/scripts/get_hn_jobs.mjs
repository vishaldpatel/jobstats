import JobDownloader from '../lib/JobDownloader.mjs';

let jobDownloader = new JobDownloader();

jobDownloader.addJobSource('https://news.ycombinator.com/item?id=20083795')
.then(() => {
  jobDownloader.getMissingJobs(() => {
    console.log(jobDownloader.getState());
  });
});