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

  loadJobSourcesFor(jobSourceName, toggledOn) {
    return new Promise((resolve, reject) => {
      this.updateStatus(`Loading data for ${jobSourceName}...`);
      GetJSON.getCompressedJSON(`../data/${jobSourceName}.json`)
      .then((jsonData) => this.processJobSourceJSON(jsonData, toggledOn))
      .then((jobSourceID) => {
        this.updateStatus(`Filtering keys for ${jobSourceName}`);
        this.applyFiltersForSource(jobSourceID);
      })
      .then(() => {
        this.reFilterJobs();
      })
      .then(() => {
        this.updateStatus(`Done applying filters for: ${jobSourceName}`);
        resolve();
      });
    });
  }

  processJobSourceJSON(jsonData, toggledOn) {
    return new Promise((resolve, reject) => {
      if (typeof(jsonData) === 'object') {
        let jobSourceID = jsonData.enabledJobSourceIDs[0];
        let jobs = jsonData.jobSources[Object.keys(jsonData.jobSources)[0]].jobs;

        let state = this.state();        
        state.jobStats.jobCounts.total += Object.keys(jobs).length;
        state.jobStats.jobCounts.jobSources[jobSourceID] = {
          total: Object.keys(jobs).length,
          filters: {}
        };
        state.jobSources = {
          ...state.jobSources,
          ...jsonData.jobSources,
        };
        state.jobs = {
          ...state.jobs,
          ...jobs
        };
        if (toggledOn) {
          state.enabledJobSourceIDs.push(jobSourceID);
        } else {
          state.jobSources[jobSourceID].enabled = false;
        }

        this.client.setState(state, () => resolve(jsonData.enabledJobSourceIDs[0]));
      } else {
        reject('Could not find "Ask HN" and "hiring?" in the title.');
      }      
    });
  }  

  loadJobSources() {
    return new Promise((resolve, reject) => {
      let state = this.state();
      let name = Object.keys(state.jobSourceNames).pop();
      let toggledOn = state.jobSourceNames[name];
      if (name) {
        delete state.jobSourceNames[name];
        this.client.setState(state, () => {
          this.loadJobSourcesFor(name, toggledOn)
          .then(() => {
            this.loadJobSources();
          });
        });
      } else {
        resolve('Done loading all jobs');
      }
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

  getResetJobCounts() {
    let state = this.state();
    let enabledJobSourceIDs = state.enabledJobSourceIDs;
    let enabledFiltersKey = state.enabledFilterKeys.join('::');
    let jobCounts = state.jobStats.jobCounts;
    jobCounts.filters = {
      [enabledFiltersKey]: 0
    };
    enabledJobSourceIDs.forEach(jobSourceID => {
      jobCounts.jobSources[jobSourceID].filtered = 0
      jobCounts.jobSources[jobSourceID].filters[enabledFiltersKey] = 0
    });

    return jobCounts;
  }

  reFilterJobs() {
    return new Promise(resolve => {
      let state = this.state();
      let filteredJobs = {};
      let jobCounts = this.getResetJobCounts();
      let enabledFiltersKey = state.enabledFilterKeys.join('::');
  
      Object.keys(state.jobs)
      .filter((jobKey) => this.shouldJobFilterThrough(state, state.jobs[jobKey]))
      .forEach(jobKey => {
        let job = state.jobs[jobKey];
        filteredJobs[jobKey] = job;
        jobCounts.filters[enabledFiltersKey] += 1;
        jobCounts.jobSources[job.jobSourceID].filters[enabledFiltersKey] += 1;
        jobCounts.jobSources[job.jobSourceID].filtered += 1;
      });
      
      state.jobStats.jobCounts = {
        ...state.jobStats.jobCounts,
        ...jobCounts,
      }
      state.jobStats.jobCounts.filters.total = Object.keys(filteredJobs).length;
      state.filteredJobs = filteredJobs;
      this.client.setState(state, () => resolve());
    });
  }

  addFilterToAllJobs(filter) {
    let state = this.state();
    Object.keys(state.jobs).forEach((jobKey) => {
      state.jobs[jobKey] = this.applyJobFilterToJob(filter, state.jobs[jobKey]);
    });
    this.client.setState(state);
  }

  deleteJobFilter(filter) {
    let state = this.state();
    this.toggleFilter(filter, false);
    delete state.jobFilters[filter];
    this.client.setState(state, () => {
      this.updateStatus(`Deleted: ${filter}`);
    });
  }

  addJobFilter(filter) {
    let state = this.state();
    state.jobFilters[filter] = {
      enabled: false
    }
    this.client.setState(state, () => {
      this.addFilterToAllJobs(filter);
      this.toggleFilter(filter, true);
    });
  }

  toggleFilter(filter, enabled) {
    let state = this.state();
    let enabledFilterKeyIndex = state.enabledFilterKeys.indexOf(filter);
    if ((enabled) && (enabledFilterKeyIndex === -1)) {
      state.enabledFilterKeys.push(filter);
    } else if ((!enabled) && (enabledFilterKeyIndex >= 0)) {
      state.enabledFilterKeys.splice(enabledFilterKeyIndex, 1);
    }
    state.jobFilters[filter].enabled = enabled;      
    this.client.setState(state,() => this.reFilterJobs());
  }

  toggleJobSource(jobSourceID, enabled) {
    jobSourceID = parseInt(jobSourceID);
    let state = this.state();
    let enabledJobSourceIDIndex = state.enabledJobSourceIDs.indexOf(jobSourceID);
    if ((enabled) && (enabledJobSourceIDIndex === -1)) {
      state.enabledJobSourceIDs.push(jobSourceID);
    } else if ((!enabled) && (enabledJobSourceIDIndex >= 0)) {
      state.enabledJobSourceIDs.splice(enabledJobSourceIDIndex, 1);
    }
    state.jobSources[jobSourceID].enabled = enabled;
    state.jobStats.jobCounts.jobSources[jobSourceID].enabled = enabled;
    this.client.setState(state,() => this.reFilterJobs());
  }

  static basicData() {
    return ({
      currentStatus: "",
      jobSourceNames: {
        /*
        'Source Name' : true if toggled on by default
        */
        '2019 - January' : false,
        '2019 - February' : false,
        '2019 - March' : false, 
        '2019 - April' : false, 
        '2019 - May' : false, 
        '2019 - June' : false,
        '2019 - July' : false,
        '2019 - August' : true
      },
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
        jobCounts: {
          total: 0,
          filters: {
            /*
            'Filter1': 0,
            'Filter1::Filter2': 0
            */
          },
          jobSources: {
            /* 
            'jobSourceID' : {
              total: 24,
              filtered: 4,
              filters: {
                'FilterName': 0,
                'Filter1::Filter2': 0
              }
            }
            */
          }
        }
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