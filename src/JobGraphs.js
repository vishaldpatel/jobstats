import React from 'react';
import ReactDOM from 'react-dom';
import {select, transition} from 'd3';
// import {scaleLinear} from 'd3-scale';

class JobGraphs extends React.Component {

  // We can probably model
  // .. Total jobs
  // .. Total jobs in each filter
  // .. Total jobs for each combination of filters

  getDOMNode() {
    return ReactDOM.findDOMNode(this);
  }

  getScales(el, domain) {
    // Compute and return the scale
    // for our visualization.
  }

  draw(el, filteredCounts) {
    select(el)
    .select('.d3-bars')
    .selectAll('rect')
    .data(filteredCounts)
    .enter()
    .append('rect')
    .attr('width', d => d)
    .attr('height', 10)
    .attr('transform', (d,i) => `translate(0, ${i*15})`);
  }

  updateDrawing(el, filteredCounts) {
    select(el)
    .select('.d3-bars')
    .selectAll('rect')
    .data(filteredCounts)
    .transition()
    .attr('width', d => d)
    .attr('height', 10)
    .attr('transform', (d,i) => `translate(0, ${i*15})`);
  }

  componentDidMount() {
    // D3's enter state
    // Data has just been added to the graph
    // update the graphs.

    let width = '900px';
    let height = '250px;';
    var el = this.getDOMNode();

    select(el)
    .append('svg')
    .attr('class', 'd3')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('class', 'd3-bars');

    this.draw(el, [1,1,1,1,1,1]);

  }

  componentDidUpdate(prevProps, prevState) {
    // D3's update state.
    // Data has been updated.
    // Update the graphs.
    let el = this.getDOMNode();
    let jobStats = this.props.jobStats;
    let jobSourceCounts = jobStats.jobCounts.jobSources;
    let filteredCounts = Object.keys(jobSourceCounts).map(key => jobSourceCounts[key].filtered);    
    if ((filteredCounts.length > 5) && (typeof(filteredCounts[0]) !== 'undefined')) {
      //console.log('Job Counts:', filteredCounts[0], filteredCounts);
      this.updateDrawing(el, filteredCounts);
    }
  }

  componentWillUnmount() {
    // D3's exit state.
    // Use this when we need
    // to unmount the 
  }

  render() {
    return(
      <div className="JobGraphs"></div>
    );
  }
}

export default JobGraphs;