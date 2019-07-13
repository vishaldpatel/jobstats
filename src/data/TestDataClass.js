class TestDataClass {
  constructor(parent) {
    this.parent = parent;
    this.state = this.parent.state;
    this.parent.setState({testData: {}});
  }

  index() {
    return this.data.TestDataClass;
  }

  create(info) {
    this.parent.setState((state) => {
      return {
        testData: {
          ...state.testData,
          [info.id]: {
            id: 0,
            name: info.name,
          }
        }
      };
    }, () => console.log(this.data));
  }
}

export default TestDataClass;