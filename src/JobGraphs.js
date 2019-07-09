import React from 'react';

class JobGraphs extends React.Component {

  render() {
    return(
      <div className="JobGraphs">
        <p>Jobs Graphs: {this.props.jobStats.jobsCount || `0 So Far`}</p>
      </div>
    );
  }
}

export default JobGraphs;