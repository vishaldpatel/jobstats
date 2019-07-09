import React from 'react';
import getJSON from './lib/getJSON.js';

class JobSources extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      jobSources: props.jobSources || {},
      newJobSourceAddress: ""
    }
  }

  addJobSourceClicked() {
    // check if source is a valid url
    // get its title, id, children list
    // check to make sure the title has "who is hiring"
    // in it.

    let hnResult = this.state.newJobSourceAddress.match(/^(https:\/\/news\.ycombinator\.com\/item\?id=)([0-9]*)$/);
    if (hnResult) {
      let jobSourceID = hnResult[2];
      getJSON(`https://hacker-news.firebaseio.com/v0/item/${jobSourceID}.json`)
      .then((listingPageJSON) => {
        this.setState({
          jobSources: {
            ...this.state.jobSources,
            [jobSourceID]: {
              name: listingPageJSON.title,
              address: this.state.newJobSourceAddress,
              childCount: listingPageJSON.descendants,
              children: listingPageJSON.kids,
              enabled: true,
            }
          }
        });
      })
      .then(() => {
        // All done requesting.
      })
    } else {
      alert('no match');
    }
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
        <input type="text" 
            onChange={(e) => this.inputChanged("newJobSourceAddress", e.target.value)} 
            placeholder="http://news.ycombinator..." />
        <button onClick={() => this.addJobSourceClicked()}>Add Source</button>
        <ul className="JobSources">
          {this.jobSources()}e
        </ul>
      </div>
    );
  }
}

export default JobSources;