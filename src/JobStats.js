import React from 'react';
import JobFilters from './JobFilters.js';
import JobSources from './JobSources.js';
import JobResults from './JobResults.js';
import JobGraphs from './JobGraphs.js'
import getJSON from './lib/getJSON.js';

class JobStats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      jobFilters: {},
      jobSources: {
        20083795: {
          name: "Ask HN: Who is hiring? (June 2019)",
          address: "https://news.ycombinator.com/item?id=20083795",
          enabled: true,
          childCount: 799,
          children: []
        }
      },
      jobStats: {
        jobCount: 0,
      },
      jobs: {
        O: {
          fullText: "Nada",
          firstLine: "title of job",
          paragraph: "lots of info about the job",
          dateCreated: '20190911',
        },
      },
      filteredJobs: {
        0: {}
      }
    }
  }

  updateInfo(key, value) {
    this.setState({
      [key]: value,
    });
  }

  getJobsFromIDs(jobIDs) {
    return new Promise((response, reject) => {
      // We are going to throttle requests for each child.
      let requestDelay = 200;
      let count = 0;
      let MAX_JOBS = 5;
      jobIDs.forEach(jobID => {
        requestDelay += 100;        
        if (count < MAX_JOBS) {
          setTimeout(() => {
            getJSON(`https://hacker-news.firebaseio.com/v0/item/${jobID}.json`)
            .then((jobData) => {
              this.cleanupAndAddJobData(jobData);
            })
          }, requestDelay);
        }
        count++;
      });
    });
  }

  htmlDecode(input)
  {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
  }

  cleanupAndAddJobData(jobData) {
    let newJob = {};
    let dateCreated = new Date(jobData.time*1000).toISOString().split("T")[0];
    newJob[jobData.id] = {
      fullText: this.htmlDecode(jobData.text),
      firstLine: this.htmlDecode(jobData.text.split("<p>")[0]),
      paragraph: this.htmlDecode(jobData.text.split("<p>").slice(1)),
      dateCreated: dateCreated,
    }

    this.setState((state, props) => {
      return {
        jobStats: {...this.state.jobStats, jobCount: this.state.jobStats.jobCount + 1 },
        jobs: {...this.state.jobs, ...newJob},
      }
    });
  }

  render() {
    return (
      <div>
        <JobFilters jobFilters={this.state.jobFilters} updateFilters={(filters) => { this.updateInfo('jobFilters', filters); }} />
        <JobSources jobSources={this.state.jobSources} updateJobSources={(sources) => { this.updateInfo('jobSources', sources); }} />
        <JobResults jobs={this.state.filteredJobs} jobCount={this.state.jobStats.jobCount} />
        <JobGraphs jobStats={this.state.jobStats} />
      </div>
     );
  }
}

export default JobStats;


// TODO:
// Get the following widgets started!

// Add URL; Scrape URL; Build Jobs data
// Shape job data
// Search / filter through jobs
// Show (filtered) jobs.
// Show basic stats as well as tag stats
// Shot trends if multiple URLs
// Need undo / redo functionailty for filters

// Try to grab the company name, location, job title etc.
// Is there a location recognizer API out there?
// For example, if you feed it a piece of text, it should
// pull out all the locations mentioned in that text
// including all abbreviations "OAK" "SF" "LA" "T.Dot" etc.
// We need a database of well-known cities and abreviations,
// and scan each listing for them.    
