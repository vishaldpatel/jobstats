import React from 'react';

class JobSources extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      newJobSourceAddress: ""
    }
  }

  jobSources() {
    return Object.keys(this.props.jobSources).map((key) => {
      // do stuff
      let jobSource = this.props.jobSources[key];
      let stats = this.props.jobStats.jobCounts.jobSources[key];
      if (typeof(stats.filtered) !== 'undefined') {
        return (
          <li key={key} className="JobSourceItem">
            <input type="checkbox" 
              defaultChecked={jobSource.enabled} 
              value={key}
              onClick={(event) => { this.props.toggleJobSource(event.target.value, event.target.checked); }} />
            <p className="SourceName">{jobSource.name}</p>
            <p className="SourceJobCounts">{stats.filtered} of {stats.total} jobs</p>
          </li>
        );
      } else {
        return (
          <li key={key} className="JobSourceItem">
            <input type="checkbox" 
              defaultChecked={jobSource.enabled} 
              value={key}
              onClick={(event) => { this.props.toggleJobSource(event.target.value, event.target.checked); }} />
            <p className="SourceName">{jobSource.name}</p>
            <p className="SourceJobCounts">{stats.total} jobs</p>
          </li>
        );
      }
    });
  }

  render() {
    return(
      <div className="JobSources">
        <h2>Sources:</h2>
        <ul className="JobSources">
          {this.jobSources()}
        </ul>
      </div>
    );
  }
}

export default JobSources;