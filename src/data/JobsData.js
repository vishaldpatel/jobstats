import getJSON from '../lib/getJSON.js';

class JobsData {
  constructor(client) {
    this.client = client;
  }

  state() {
    return this.client.state;
  }

  addJobSource(url) {
    return new Promise((resolve, reject) => {
      let hnResult = url.match(/^(https:\/\/news\.ycombinator\.com\/item\?id=)([0-9]*)$/);
      if (hnResult) {
        let jobSourceID = hnResult[2];
        getJSON(`https://hacker-news.firebaseio.com/v0/item/${jobSourceID}.json`)
        .then((listingPageJSON) => {
          if (listingPageJSON.title.includes("Ask HN:")
          && listingPageJSON.title.includes("hiring?")) {
            this.client.setState((state) => {
              jobSourceID = listingPageJSON.id; // Switch to the integer version
              state.jobSources[jobSourceID] = {
                name: listingPageJSON.title,
                address: state.newJobSourceAddress,
                childCount: listingPageJSON.descendants,
                children: listingPageJSON.kids,
                enabled: true,
              }
              if (!state.enabledJobSourceIDs.includes(jobSourceID)) {
                state.enabledJobSourceIDs.push(jobSourceID);
              }
              return state;
            }, () => {
              resolve('Great Success!');
            });
          } else {
            reject('Could not find "Ask HN" and "hiring?" in the title.');
          }
        })
      } else {
        reject(`Could not correctly parse url: ${url}`);
      }
    });
  }

  getMissingJobs() {
    let state = this.state();
    let newJobs = Object.keys(state.jobSources).map((key) => {
      return state.jobSources[key].children;
    })
    .flat()
    .filter((jobKey) => !state.jobs[jobKey]);
    
    this.getJobsFromIDs(newJobs);
  };

  getJobsFromIDs(jobIDs) {
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

  }

  htmlDecode(input)
  {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
  }

  cleanupAndAddJobData(jobData) {
    let dateCreated = new Date(jobData.time*1000).toISOString().split("T")[0];
    let newJob = {
      id: jobData.id,
      jobSourceID: jobData.parent,
      fullText: this.htmlDecode(jobData.text),
      firstLine: this.htmlDecode(jobData.text.split("<p>")[0]),
      paragraph: this.htmlDecode(jobData.text.split("<p>").slice(1)),
      dateCreated: dateCreated,
      jobFilters: {},
    }    
    this.client.setState((state) => {    
      state.jobStats.jobCount = state.jobStats.jobCount + 1;
      state.jobs[newJob.id] = newJob;
      return state;
    }, () => { 
      this.applyFiltersToJob(newJob);
      this.reFilterJob(newJob);
    });
  }

  applyJobFilterToJob(jobFilter, job) {
    if (job.fullText.match(jobFilter)) {
      job.jobFilters[jobFilter] = true;
    } else {
      job.jobFilters[jobFilter] = false;
    }
    return job;
  }

  applyFiltersToJob(job) {
    this.client.setState((state) => {
      Object.keys(state.jobFilters).forEach((key) => {
        job = this.applyJobFilterToJob(key, job)
      });
      
      state.jobs[job.id] = job;
      return state;
    });
  }

  shouldJobFilterThrough(state, job) {
    let enabledFilterKeys = state.enabledFilterKeys;
    let enabledJobSourceIDs = state.enabledJobSourceIDs;
    return (
      (enabledJobSourceIDs.includes(job.jobSourceID)) && 
      (enabledFilterKeys.every(filterKey => job.jobFilters[filterKey]))
    )    
  }

  reFilterJob(job) {
    let state = this.state();
    if (this.shouldJobFilterThrough(state, job)) {
      this.client.setState((state) => {
        state.filteredJobs[job.id] = job;
        return state;
      });      
    }
  }

  reFilterJobs() {
    let state = this.state();
    let filteredJobs = {};

    Object.keys(state.jobs)
    .filter((jobKey) => this.shouldJobFilterThrough(state, state.jobs[jobKey]))
    .forEach(jobKey => {
      filteredJobs[jobKey] = state.jobs[jobKey];
    });
    this.client.setState((state) => {
      state.filteredJobs = filteredJobs;
      return state;
    });
  }

  addFilterToAllJobs(filter) {
    this.client.setState(state => {
      Object.keys(state.jobs).forEach((jobKey) => {
        state.jobs[jobKey] = this.applyJobFilterToJob(filter, state.jobs[jobKey]);
      });
      return state;
    });
  }

  addJobFilter(filter) {
    this.client.setState((state) => {
      state.jobFilters[filter] = {
        enabled: false
      }
      if (!state.enabledFilterKeys.includes(filter)) {
        state.enabledFilterKeys.push(filter);
      }
      return state;
    }, () => {this.addFilterToAllJobs(filter)});
  }

  toggleFilter(filter, enabled) {
    this.client.setState((state) => {
      let enabledFilterKeyIndex = state.enabledFilterKeys.indexOf(filter);
      if ((enabled) && (enabledFilterKeyIndex === -1)) {
        state.enabledFilterKeys.push(filter);
      } else if ((!enabled) && (enabledFilterKeyIndex >= 0)) {
        state.enabledFilterKeys.splice(enabledFilterKeyIndex, 1);
      }
      state.jobFilters[filter].enabled = enabled;      
      return state;
    }, () => { this.reFilterJobs() });
  }

  toggleJobSource(jobSourceID, enabled) {
    jobSourceID = parseInt(jobSourceID);
    this.client.setState((state) => {
      let enabledJobSourceIDIndex = state.enabledJobSourceIDs.indexOf(jobSourceID);
      if ((enabled) && (enabledJobSourceIDIndex === -1)) {
        state.enabledJobSourceIDs.push(jobSourceID);
      } else if ((!enabled) && (enabledJobSourceIDIndex >= 0)) {
        state.enabledJobSourceIDs.splice(enabledJobSourceIDIndex, 1);
      }
      state.jobSources[jobSourceID].enabled = enabled;
      return state;
    }, () => { this.reFilterJobs() });
  }

  static basicData() {
    return ({
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
         enabled: false,
       },
       "Crunchbase" : {
         enabled: false,
       }
      },
      enabledFilterKeys: [],
      enabledJobSourceIDs: [],
      filteredJobs: {
        // Basically jobs filtered by jobFilters
      }
    });
  }
}

export default JobsData;