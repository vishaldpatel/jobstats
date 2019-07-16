import JobDownloader from '../lib/JobDownloader.mjs';

let jobDownloader = new JobDownloader();

jobDownloader.getJobDataFrom('https://news.ycombinator.com/item?id=20083795');