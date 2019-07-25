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
      return (
        <li key={key} className="JobSourceItem">
          <input type="checkbox" 
            defaultChecked={jobSource.enabled} 
            value={key}
            onClick={(event) => { this.props.toggleJobSource(event.target.value, event.target.checked); }} />
          {jobSource.name} -- {stats.total} jobs Found. {stats.filtered} filtered.
        </li>
      );
    });
  }

  render() {
    return(      
      <div className="JobSources">
        <ul className="JobSources">
          {this.jobSources()}
        </ul>
      </div>
    );
  }
}

export default JobSources;