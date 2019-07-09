import React from 'react';
import JobFilters from './JobFilters.js';
import JobSources from './JobSources.js';
import JobResults from './JobResults.js';
import JobGraphs from './JobGraphs.js'

class JobStats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      jobFilters: {},
      jobSources: {
        20083795: {
          name: "Ask HN: Who is hiring? (June 2019)",
          address: "https://news.ycombinator.com/item?id=20083795",
          enabled: true
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
    }
  }
  

  getJSON(url) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.DONE) {
          if (request.status === 200) {
            // Great success!
            resolve(JSON.parse(request.responseText));
          } else if (typeof reject !== undefined) {
            reject(`${request.status}: ${request.statusText}`);
          }
        }
      }
      request.open("GET", url);
      request.send();
    });
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
        requestDelay += 200;        
        if (count < MAX_JOBS) {
          setTimeout(() => {
            this.getJSON(`https://hacker-news.firebaseio.com/v0/item/${jobID}.json`)
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

  handleClick(val) {
    if (val === undefined) {      
      this.getJSON("https://hacker-news.firebaseio.com/v0/item/20083795.json")
      .then((listingPageJSON) => {
        this.getJobsFromIDs(listingPageJSON.kids);
      })
      .then(() => {
        // All job requests scheduled.
      })
    } else {
      this.setState({value: val});
    }
  }

  render() {
    return (
      <div>
        <JobFilters jobFilters={this.state.jobFilters} updateFilters={(filters) => { this.updateInfo('jobFilters', filters); }} />
        <JobSources jobSources={this.state.jobSources} updateJobSources={(sources) => { this.updateInfo('jobSources', sources); }} />
        <button onClick={() => this.handleClick()}>Scan Jobs</button>
        <JobResults jobs={this.state.jobs} jobCount={this.state.jobStats.jobCount} />
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
