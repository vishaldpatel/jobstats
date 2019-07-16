import https from 'https';
import fs from 'fs';

class JobDownloader {
  constructor() {
    this.state = JobDownloader.basicData();
  }

  getState() {
    return this.state;
  }

  setState(stateSetter, callback) {
    this.state = stateSetter(this.state);
    callback();
  }

  getJSON(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        res.on('data', (data) => {
          resolve(JSON.parse(data));
        });
      }).on('error', (e) => {
        reject(`${e}`);
      });      
    });
  }

  addJobSource(url) {
    return new Promise((resolve, reject) => {
      let hnResult = url.match(/^(https:\/\/news\.ycombinator\.com\/item\?id=)([0-9]*)$/);
      if (hnResult) {
        let jobSourceID = hnResult[2];
        this.getJSON(`https://hacker-news.firebaseio.com/v0/item/${jobSourceID}.json`)
        .then((listingPageJSON) => {
          if (listingPageJSON.title.includes("Ask HN:")
          && listingPageJSON.title.includes("hiring?")) {
            this.setState((state) => {
              jobSourceID = listingPageJSON.id; // Switch to the integer version
              state.jobSources[jobSourceID] = {
                name: listingPageJSON.title,
                address: state.newJobSourceAddress,
                childCount: listingPageJSON.descendants,
                children: listingPageJSON.kids,
                jobs: {},
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

  getMissingJobs(callback) {
    let state = this.state;
    let newJobs = Object.keys(state.jobSources).map((key) => {
      if (Object.keys(state.jobSources[key].jobs).length === 0) {
        return state.jobSources[key].children;
      }
    }).flat()
    
    this.getJobsFromIDs(newJobs, callback);
  };

  getJobsFromIDs(jobIDs, callback) {
    // We are going to throttle requests for each child.
    let requestDelay = 200;
    let jobDataSoFar = 0;
    
    jobIDs.forEach(jobID => {
      requestDelay += 100;
      
      setTimeout(() => {
        this.getJSON(`https://hacker-news.firebaseio.com/v0/item/${jobID}.json`)
        .then((jobData) => {
          console.log('.');
          this.cleanupAndAddJobData(jobData);
          jobDataSoFar++;
          if ((jobDataSoFar >= jobIDs.length) && (callback !== undefined)) {
            callback();
          }
        })
      }, requestDelay);
    });

  }

  cleanupAndAddJobData(jobData) {    
    if (typeof(jobData.text) === 'undefined') {
      return -1;
    }
    let dateCreated = new Date(jobData.time*1000).toISOString().split("T")[0];
    let newJob = {
      id: jobData.id,
      jobSourceID: jobData.parent,
      fullText: jobData.text,
      firstLine: jobData.text.split("<p>")[0],
      paragraph: jobData.text.split("<p>").slice(1),
      dateCreated: dateCreated,
      jobFilters: {},
    }
    this.setState((state) => {
      state.jobStats.jobCount = state.jobStats.jobCount + 1;
      state.jobSources[jobData.parent].jobs[newJob.id] = newJob;
      return state;
    }, () => { 
      // this.applyFiltersToJob(newJob);
      // this.reFilterJob(newJob);
    });
  }


  saveTo(path) {
    console.log("\n\nOKAY SO THIS IS STATE:\n");
    console.log("--------------------------");
    console.log(this.state);
    fs.writeFile(path, JSON.stringify(this.state), (err) => {
      console.log("Great success!");
    })
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
          jobs: {
            jobID: { job details },
            O: {
              fullText: "Nada",
              firstLine: "title of job",
              paragraph: "lots of info about the job",
              dateCreated: '20190911',
            },
          },        
        }
        */
      },
      jobStats: {
        jobCount: 0,
        filteredJobsCount: 0,
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

export default JobDownloader;