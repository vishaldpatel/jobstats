import React from 'react';

class JobFilters extends React.Component {
  constructor(props) {
    super(props);
    if (props.jobFilters !== undefined) {
      this.state = {
        filters: props.jobFilters,
        newFilter: "NotNew"
      }
    } else {
      this.state = {
        filters: {
          1: { name: "SF&Elixir", enabled: true },
          2: { name: "Los Angeles", enabled: false },
        },
        newFilter: "Pretty New"
      }
    }
  }

  updateFilterProps() {
    if (this.props.updateInfo !== undefined) {
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

  toggleFilterClicked(filterID) {
    this.setState({
      filters: {
        ...this.state.filters,
        [filterID]: {
          ...this.state.filters[filterID],
          enabled: !this.state.filters[filterID].enabled 
        }
      }
    });
    this.updateFilterProps();
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
          {filter.name}
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