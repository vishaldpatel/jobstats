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

  scaled(num) {
    if (typeof(num) === 'undefined') {
      return 0;
    } else {
      return Math.log(num)*15;
    }
  }

  draw(el, filteredCounts) {    
    select(el)
    .select('.d3-bars')
    .selectAll('rect')
    .data(filteredCounts)
    .enter()
    .append('rect')
    .attr('height', d => this.scaled(d))
    .attr('width', 10)
    .attr('transform', (d,i) => `translate(${i*15}, ${145 - this.scaled(d)})`);
  }

  updateDrawing(el, prevFilteredCounts, filteredCounts) {
    select(el)
    .select('.d3-bars')
    .selectAll('rect')
    .data(filteredCounts)
    .transition()
    .attr('height', d => this.scaled(d))
    .attr('width', 10)
    .attr('transform', (d,i) => `translate(${(i+1)*15}, ${145 - this.scaled(d)})`);
  }

  componentDidMount() {
    let width = '300px';
    let height = '250px;';
    var el = this.getDOMNode();

    select(el)
    .append('svg')
    .attr('class', 'd3')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('class', 'd3-bars');

    this.draw(el, [1,1,1,1,1,1,1,1]);

  }

  componentDidUpdate(prevProps) {
    // We need to know
    // the filter name, associated color
    // and its amount in order
    // to appropriately map data
    // to local state.

    let el = this.getDOMNode();
    let jobStats = this.props.jobStats;
    let jobSourceCounts = jobStats.jobCounts.jobSources;
    let prevJobSourceCounts = prevProps.jobStats.jobCounts.jobSources;
    let filteredCounts = Object.keys(jobSourceCounts).map(key => jobSourceCounts[key].filtered);
    let previousFilteredCounts = Object.keys(prevJobSourceCounts).map(key => prevJobSourceCounts[key].filtered);    
    if (filteredCounts.length > 5) {
      this.updateDrawing(el, previousFilteredCounts,filteredCounts);
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