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
        <div className="row StatusRow">
          <div className="col-3"></div>
          <div className="col-9">
            <StatusBar status={this.state.currentStatus} />
          </div>
        </div>
        <div className="row">
          <div className="col-3 SourcesAndAnalytics">
            <JobGraphs jobStats={this.state.jobStats} />
            <JobFilters jobFilters={this.state.jobFilters}
                        addJobFilter={(filter) => { this.jobsData.addJobFilter(filter) }}
                        deleteFilter = {(filter) => { this.jobsData.deleteJobFilter(filter) }}
                        toggleJobFilter={(filter, enabled) => { this.jobsData.toggleFilter(filter, enabled); }} />            
            <JobSources jobSources={this.state.jobSources}
                        jobStats={this.state.jobStats}        
                        toggleJobSource={(jobSourceID, enabled) => { this.jobsData.toggleJobSource(jobSourceID, enabled); }} />
          </div>
          <div className="col-9">            
            <JobResults jobs={this.state.filteredJobs} jobStats={this.state.jobStats} />
          </div>
        </div>
      </div>
     );
  }
}

export default JobStats;