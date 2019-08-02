import React from 'react';

class JobFilters extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newFilter: "NotNew"
    }
  }

  addFilterClicked() {
    this.props.addJobFilter(this.state.newFilter);
  }

  inputChanged(inputName, value) {
    this.setState({
      [inputName]: value,
    })
  }

  filters() {
    return Object.keys(this.props.jobFilters).map((filterKey) => {
      // do stuff
      let jobFilter = this.props.jobFilters[filterKey];
      return (
        <li key={filterKey} className="FilterItem">
          <input type="checkbox" 
            defaultChecked={jobFilter.enabled} 
            value={filterKey} 
            onClick={(event) => { this.props.toggleJobFilter(event.target.value, event.target.checked); }} />
          {filterKey}
        </li>
      );
    });
  }

  render() {
    return (
      <div className="JobFilters">
        <h2>Filters:</h2>
        <input type="text" 
            onChange={(e) => this.inputChanged("newFilter", e.target.value)} 
            placeholder="Some Regex like SF|Los Angeles React|PHP etc.." />
        <button onClick={() => this.addFilterClicked()}>Add Filter</button>
        <ul className="Filters">
          {this.filters()}
        </ul>
      </div>
    )
  }
}

export default JobFilters;