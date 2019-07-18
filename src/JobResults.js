import React from 'react';
import HtmlToReact from 'html-to-react';

class JobResults extends React.Component {
  filteredJobs() {
    // run a map
    let parser = new HtmlToReact.Parser()
    return Object.keys(this.props.jobs).map((jobKey) => {
      let job = this.props.jobs[jobKey];
      let firstLine = parser.parse(job.firstLine);
      return <li key={`job${jobKey}`}>{job.dateCreated} | {firstLine}</li>;
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