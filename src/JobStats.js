import React from 'react';
import JobFilters from './JobFilters.js';
import JobSources from './JobSources.js';
import JobResults from './JobResults.js';
import JobGraphs from './JobGraphs.js'
import getJSON from './lib/getJSON.js';
import TestDataClass from './data/TestDataClass.js';

class JobStats extends React.Component {
  constructor(props) {
    super(props);    

    this.state = {
      jobSources: {
        /*
        jobSourceID: { jobSource details },
        20083795: {
          name: "Ask HN: Who is hiring? (June 2019)",
          address: "https://news.ycombinator.com/item?id=20083795",
          enabled: true,
          childCount: 799,
          children: []
        }
        */
      },
      jobStats: {
        jobCount: 0,
        filteredJobsCount: 0,
      },
      jobs: {
        /*
        jobID: { job details },
        O: {
          fullText: "Nada",
          firstLine: "title of job",
          paragraph: "lots of info about the job",
          dateCreated: '20190911',
        },
        */
      },
      jobFilters: {
        /*
        filter: [array of matching job ids],
        "SF|San Francisco|LA|Los Angeles": {
          enabled: true,
          jobIDs: [123,43,124,...],
        },
        "LA": { 
          enabled: false,
          jobIDs: [],
        }
        "React": { 
          enabled: false,
          jobIDs: [123, 45],
        }
        */
       "SF|San Francisco|New York" : {
         jobIDs: [],
       },
       "Crunchbase" : {
         jobIDs: [],
       }
      },
      enabledFilters: [],
      filteredJobs: {
        // Basically jobs filtered by jobFilters
      }
    }
  }

  componentDidMount() {
    this.testDataClass = new TestDataClass(this);
    this.testDataClass.create({id: 25, name: "da man!"});
    this.addJobSource("https://news.ycombinator.com/item?id=20083795");
  }

  updateInfo(key, value) {
    this.setState({
      [key]: value,
    });
  }

  addJobSource(url) {
    let hnResult = url.match(/^(https:\/\/news\.ycombinator\.com\/item\?id=)([0-9]*)$/);
    if (hnResult) {
      let jobSourceID = hnResult[2];
      getJSON(`https://hacker-news.firebaseio.com/v0/item/${jobSourceID}.json`)
      .then((listingPageJSON) => {
        if (listingPageJSON.title.includes("Ask HN:")
        && listingPageJSON.title.includes("hiring?")) {
          this.setState({
            jobSources: {
              ...this.state.jobSources,
              [jobSourceID]: {
                name: listingPageJSON.title,
                address: this.state.newJobSourceAddress,
                childCount: listingPageJSON.descendants,
                children: listingPageJSON.kids,
                enabled: true,
              }
            }
          }, () => {
            this.getMissingJobs();
          });
        }
      })
      .then(() => {
        // All done requesting.
      })
    } else {
      alert('no match');
    }
  }

  getMissingJobs() {
    let newJobs = Object.keys(this.state.jobSources).map((key) => {
      return this.state.jobSources[key].children;
    })
    .flat()
    .filter((jobKey) => !this.state.jobs[jobKey]);

    this.getJobsFromIDs(newJobs);
  };

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
      id: jobData.id,
      fullText: this.htmlDecode(jobData.text),
      firstLine: this.htmlDecode(jobData.text.split("<p>")[0]),
      paragraph: this.htmlDecode(jobData.text.split("<p>").slice(1)),
      dateCreated: dateCreated,
    }

    this.setState((state) => {
      return {
        jobStats: {...state.jobStats, jobCount: state.jobStats.jobCount + 1 },
        jobs: {...state.jobs, ...newJob},
      };
    }, () => {
      this.applyJobFilters(newJob[jobData.id]);      
    });
  }

  applyJobFilters(newJob) {
    if (this.state.enabledFilters.length === 0) {
      this.addToFilteredJobs(newJob)
    } else {
      Object.keys(this.state.jobFilters).forEach((key) => {      
        if (newJob.fullText.match(key)
        && !this.state.jobFilters[key].jobIDs.includes(newJob.id)) {        
          this.setState((state) => {
            return {
              jobFilters: {
                ...state.jobFilters,
                [key]: {
                  ...state.jobFilters[key],
                  jobIDs: [...state.jobFilters[key].jobIDs, newJob.id]
                }
              }
            }
          }, () => this.addToFilteredJobs(newJob));
        }
      })
    }
  }

  addToFilteredJobs(job) {
    console.log(this.state);
    let enabledFilterKeys = this.state.enabledFilters;
    console.log(enabledFilterKeys);
    if ((
          (enabledFilterKeys.length > 0) && 
          (enabledFilterKeys.every(filterKey => this.state.jobFilters[filterKey].jobIDs.includes(job.id))) 
        ) || 
        (enabledFilterKeys.length === 0)
      ) {
      console.log('got in here somehow');
      this.setState((state) => {
        return {
          filteredJobs: {
            ...state.filteredJobs,
            [job.id]: job
          }
        };
      }, () => console.log(this.state.filteredJobs))
    }
  }
/*
  applyFilteredJobs() {
    let filteredJobs = {};
    let enabledFilterKeys = Object.keys(this.state.jobFilters).filter(key => this.state.jobFilters[key].enabled);
    let filteredJobIDs = [];

    if (enabledFilterKeys.length > 0) {
      filteredJobIDs = this.state.jobFilters[enabledFilterKeys[0]].jobIDs;
      if (enabledFilterKeys.length > 1) {
        filteredJobIDs = enabledFilterKeys.slice(1).reduce((jobIDs, filterKey) => {
          // for the filter key, get matching jobIds
          return jobIDs.filter((jobID) => enabledFilterKeys[filterKey].jobIDs.includes(jobID));
        }, filteredJobIDs);
      }
    } else {
      filteredJobIDs = Object.keys(this.state.jobs);
    }

    filteredJobIDs.forEach(jobID => {
      filteredJobs[jobID] = this.state.jobs[jobID];
    });

    this.setState({
      filteredJobs: filteredJobs
    });
  } */

  addJobFilter(filter) {
    //
  }

  toggleFilter(filter) {
    // 
  }

  render() {
    return (
      <div>
        <JobFilters jobFilters={this.state.jobFilters} updateFilters={(filters) => { this.updateInfo(filters); }} />
        <JobSources jobSources={this.state.jobSources} addJobSource={(url) => { this.addJobSource(url); }} />
        <JobResults jobs={this.state.filteredJobs} jobStats={this.state.jobStats} />
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
