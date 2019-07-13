import React from 'react';

class JobSources extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      newJobSourceAddress: ""
    }
  }

  addJobSourceClicked() {
    this.props.addJobSource(this.state.newJobSourceAddress);
  }

  inputChanged(inputName, value) {
    this.setState({
      [inputName]: value,
    })
  }

  toggleJobSourceClicked(jobID) {
    alert(jobID);
  }

  deleteJobSourceClicked() {

  }

  jobSources() {
    return Object.keys(this.props.jobSources).map((key) => {
      // do stuff
      let jobSource = this.props.jobSources[key];
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
        <input type="text" 
            onChange={(e) => this.inputChanged("newJobSourceAddress", e.target.value)} 
            placeholder="http://news.ycombinator..." />
        <button onClick={() => this.addJobSourceClicked()}>Add Source</button>
        <ul className="JobSources">
          {this.jobSources()}
        </ul>
      </div>
    );
  }
}

export default JobSources;