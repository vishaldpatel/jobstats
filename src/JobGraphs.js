import React from 'react';

class JobGraphs extends React.Component {

  // We can probably model
  // .. Total jobs
  // .. Total jobs in each filter
  // .. Total jobs for each combination of filters
  constructor(props) {
    super(props);
    this.state = props;
  }

  componentDidUpdate(prevProps, prevState) {
    // Compare new props to previous props
    // update state if needed
    // write code for transitions here... maybe.
  }

  render() {
    return(
      <div className="JobGraphs">
        <p>Jobs Graphs: {this.props.jobStats.jobsCount || `0 So Far`}</p>
      </div>
    );
  }
}

export default JobGraphs;