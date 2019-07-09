import React from 'react';

class JobSources extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      jobSources: props.jobSources || {},
    }
  }

  addJobSourceClicked() {
    // check if source is a valid url
    // get its title, id, children list
    // check to make sure the title has "who is hiring"
    // in it.
  }

  newJobSourceChanged() {

  }

  toggleJobSourceClicked(jobID) {
    alert(jobID);
  }

  deleteJobSourceClicked() {

  }

  jobSources() {
    return Object.keys(this.state.jobSources).map((key) => {
      // do stuff
      let jobSource = this.state.jobSources[key];
      return (
        <li key={key} className="JobSourceItem">
          <input type="checkbox" defaultChecked={jobSource.enabled} onClick={() => { this.toggleJobSourceClicked(key); }} />
          {jobSource.name}
        </li>
      );
    });
  }

  render() {
    return(      
      <div className="JobSources">
        <input type="text" onChange={() => this.newJobSourceChanged()} />
        <button onClick={() => this.addJobSourceClicked()}>Add Source</button>
        <ul className="JobSources">
          {this.jobSources()}
        </ul>
      </div>
    );
  }
}

export default JobSources;