import React from 'react';

class StatusBar extends React.Component {
  render() {
    return(      
      <div className="StatusBar">
        <span>Status: {this.props.status}</span>
      </div>
    );
  }
}

export default StatusBar;