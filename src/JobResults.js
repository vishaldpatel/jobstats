import React from 'react';
import HtmlToReact from 'html-to-react';

class JobResults extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      expandedJobs: {}
    };
  }

  toggleExpansion(item) {
    let key = item.id.match(/^jobResult(\d*)$/)[1];
    this.setState(state => state.expandedJobs[key] = !state.expandedJobs[key]);
  }

  filteredJobs() {
    // run a map
    let parser = new HtmlToReact.Parser()
    return Object.keys(this.props.jobs).map((jobKey) => {
      let job = this.props.jobs[jobKey];
      let firstLine = parser.parse(job.firstLine);
      // let firstLine = job.firstLine;
      if (this.state.expandedJobs[jobKey]) {
        return (
          <li key={`job${jobKey}`}>
          <span id={`jobResult${jobKey}`} onClick={(e) => this.toggleExpansion(e.target)}>{job.dateCreated} | {firstLine}</span>
          <p>{job.paragraph}</p>
          </li>
        );
      } else {
        return <li key={`job${jobKey}`} id={`jobResult${jobKey}`} onClick={(e) => this.toggleExpansion(e.target)}>{job.dateCreated} | {firstLine}</li>;
      }
    });
  }

  render() {
    return(
      <div className="JobResults">
        <p>Jobs: {this.props.jobStats.filteredJobCount} filtered of {this.props.jobStats.jobCount} jobs found.</p>
        <ul>
          {this.filteredJobs()}
        </ul>
      </div>
    );
  }
}

export default JobResults;