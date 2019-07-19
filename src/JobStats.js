import React from 'react';
import JobFilters from './JobFilters.js';
import JobSources from './JobSources.js';
import JobResults from './JobResults.js';
import JobGraphs from './JobGraphs.js'
import JobsData from './data/JobsData.js';
import StatusBar from './StatusBar.js';

class JobStats extends React.Component {
  constructor(props) {
    super(props);
    this.state = JobsData.basicData();
    this.jobsData = new JobsData(this);
  }

  componentDidMount() {
    console.log('Begin engines..');
    this.jobsData.loadJobSources()
    .then((message) => {
      console.log('should be done by now, yah?');
      this.setState(state => {
        state.currentStatus = message;
        return state;
      })
    });
  }

  render() {
    return (
      <div>
        <StatusBar status={this.state.currentStatus} />
        <JobFilters jobFilters={this.state.jobFilters} 
                    addJobFilter={(filter) => { this.jobsData.addJobFilter(filter) }}
                    toggleJobFilter={(filter, enabled) => { this.jobsData.toggleFilter(filter, enabled); }} />
        <JobSources jobSources={this.state.jobSources}
                    toggleJobSource={(jobSourceID, enabled) => { this.jobsData.toggleJobSource(jobSourceID, enabled); }} />
        <JobResults jobs={this.state.filteredJobs} jobStats={this.state.jobStats} />
        <JobGraphs jobStats={this.state.jobStats} />
      </div>
     );
  }
}

export default JobStats;


// TODO:
// Get the following widgets started!

// Add URL; Scrape URL; Build Jobs data [done]
// Shape job data [done]
// Search / filter through jobs [doing]
// Show (filtered) jobs. [doing]
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
