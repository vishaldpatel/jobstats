import React from 'react';

class JobResults extends React.Component {
  filteredJobs() {
    // run a map
    return Object.keys(this.props.jobs).map((jobKey) => {
      let job = this.props.jobs[jobKey];
      return <li key={`job${jobKey}`}>{job.dateCreated} | {job.firstLine}</li>;
    });
  }

  render() {
    return(
      <div className="JobResults">
        <p>Jobs Found: {this.props.jobStats.jobCount || `0 So Far`}</p>
        <ul>
          {this.filteredJobs()}
        </ul>
      </div>
    );
  }
}

export default JobResults;