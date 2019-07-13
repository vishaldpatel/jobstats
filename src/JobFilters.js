import React from 'react';

class JobFilters extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: props.jobFilters || {},
      newFilter: "NotNew"
    }
  }

  updateFilterProps() {
    if (typeof(this.props.updateInfo) !== 'undefined') {
      this.props.updateFilters(this.state.filters)
    }
  }

  addFilterClicked() {
    // Update State
    // Notify parent that a new item was added
    
    this.setState((state, props) => {
      return {
        newFilter: "Reset"
      }
    });
    this.updateFilterProps();
  }

  toggleFilterClicked(filterKey) {
    let newState = this.state;
    newState.filters[filterKey].enabled = !newState.filters[filterKey].enabled;
    this.setState(newState, () => this.updateFilterProps());
  }

  deleteFilterClicked(filterID) {
    // Delete filter
    this.updateFilterProps();
  }

  newFilterChanged(element) {
    // Do nothing
    this.setState((state, props) => {
      return {
        newFilter: "CLICK"
      }
    });
  }

  filters() {
    return Object.keys(this.state.filters).map((filterKey) => {
      // do stuff
      let filter = this.state.filters[filterKey];
      return (
        <li key={filterKey} className="FilterItem">
          <input type="checkbox" defaultChecked={filter.enabled} onClick={() => { this.toggleFilterClicked(filterKey); }} />
          {filterKey}
        </li>
      );
    });
  }

  render() {
    return (
      <div className="JobFilters">
        <input type="text" onChange={() => this.newFilterChanged()} />
        <button onClick={() => this.addFilterClicked()}>Add Filter</button>
        <ul className="Filters">
          {this.filters()}
        </ul>
      </div>
    )
  }
}

export default JobFilters;