import GetJSON from '../lib/getJSON.js';

class JobsData {
  constructor(client) {
    this.client = client;
  }

  state() {
    return this.client.state;
  }

  updateStatus(message) {
    this.client.setState(state => { state.currentStatus = message; return state; });
  }

  loadJobSourcesFor(jobSourceNames) {
    return new Promise((resolve, reject) => {
      let jobSourceName = jobSourceNames.pop();      
      if (typeof(jobSourceName) !== 'undefined') {
        this.updateStatus(`Loading data for ${jobSourceName}...`);
        GetJSON.getCompressedJSON(`../data/${jobSourceName}.json`)
        .then((jsonData) => this.processJobSourceJSON(jsonData))
        .then((jobSourceID) => {
          this.updateStatus(`Filtering keys for ${jobSourceName}`);
          this.applyFiltersForSource(jobSourceID);
        })
        .then(() => {
          this.reFilterJobs();
        })
        .then(() => {
          this.updateStatus(`Done applying filters for: ${jobSourceName}`);
          this.loadJobSourcesFor(jobSourceNames);
        });
      } else {
        console.log('do i ever get here?');
        resolve('Done loading all jobs');
      }
    });
  }

  processJobSourceJSON(jsonData) {
    return new Promise((resolve, reject) => {
      if (typeof(jsonData) === 'object') {
        let jobs = jsonData.jobSources[Object.keys(jsonData.jobSources)[0]].jobs;
        this.client.setState((state) => {
          state.jobStats.jobCount = Object.keys(jobs).length;
          state.jobSources = {
            ...state.jobSources,
            ...jsonData.jobSources,
          };
          state.jobs = {
            ...state.jobs,
            ...jobs
          };
          state.enabledJobSourceIDs.push(jsonData.enabledJobSourceIDs[0]);
          return state;
        }, () => {
          resolve(jsonData.enabledJobSourceIDs[0]);
        });
      } else {
        reject('Could not find "Ask HN" and "hiring?" in the title.');
      }      
    });
  }  

  loadJobSources() {
    return new Promise((resolve, reject) => {
      // Load job sources one at a time.
      this.loadJobSourcesFor(this.state().jobSourceNames)
      .then((message) => {
        resolve(message);
      })
    });
  }

  applyFiltersForSource(jobSourceID) {
    let jobKeys = Object.keys(this.state().jobSources[jobSourceID].jobs);
    let jobsLeft = jobKeys.length;
    return new Promise((resolve, reject) => {
      jobKeys.forEach((jobKey) => {
        let job = this.state().jobs[jobKey];
        if (typeof(job) === 'object') {
          this.applyFiltersToJob(job)
          .then(() => {
            jobsLeft--;
            if (jobsLeft === 0) {
              resolve();
            }
          });
        }
      });
    });
  }

  applyFiltersToJob(job) {
    let jobFilters = this.state().jobFilters;
    let filtersLeft = Object.keys(jobFilters).length;
    return new Promise((resolve, reject) => {
      Object.keys(jobFilters).forEach((key) => {
        job = this.applyJobFilterToJob(key, job);
        filtersLeft--;
        if (filtersLeft === 0) {          
          resolve(job);
        }
      });
    })
  }

  applyJobFilterToJob(jobFilter, job) {
    if (job.fullText.match(jobFilter)) {
      job.jobFilters[jobFilter] = true;
    } else {
      job.jobFilters[jobFilter] = false;
    }
    return job;
  }


  shouldJobFilterThrough(state, job) {
    let enabledFilterKeys = state.enabledFilterKeys;
    let enabledJobSourceIDs = state.enabledJobSourceIDs;
    return (
      (enabledJobSourceIDs.includes(job.jobSourceID)) && 
      (enabledFilterKeys.every(filterKey => job.jobFilters[filterKey]))
    )    
  }

  reFilterJobs() {
    return new Promise(resolve => {
      let state = this.state();
      let filteredJobs = {};
  
      Object.keys(state.jobs)
      .filter((jobKey) => this.shouldJobFilterThrough(state, state.jobs[jobKey]))
      .forEach(jobKey => {
        filteredJobs[jobKey] = state.jobs[jobKey];
      });
      this.client.setState((state) => {
        state.jobStats.filteredJobCount = Object.keys(filteredJobs).length;
        state.filteredJobs = filteredJobs;
        return state;
      }, () => {
        resolve();
      });
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
    // TODO: Check if jobs from that source have been loaded
    // if not, then load the jobs first.
    // If jobs have not been received
    // then, get the jobs and apply filters them.

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
      currentStatus: "",
      jobSourceNames: [
        /*
        '2019 - January',
        '2019 - February',
        '2019 - March', 
        '2019 - April', 
        '2019 - May', 
        */
        '2019 - June' 
      ],
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
        filteredJobCount: 0,
      },
      jobs: {
        /*
        jobID: { job details },
        O: {
          id: 123,
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
       "Remote|remote" : {
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