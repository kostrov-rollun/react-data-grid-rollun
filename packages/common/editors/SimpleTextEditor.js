const React = require('react');

class SimpleTextEditor extends React.Component {
  getInputNode() {
    return this.input;
  }

  getValue() {
    return {
      [this.props.column.key]: this.input.value
    };
  }

  setInputRef = (input) => {
    this.input = input;
  };

  render() {
    return (<input ref={this.setInputRef} type="text" onBlur={this.props.onBlur} className="form-control" defaultValue={this.props.value} />);
  }
}

module.exports = SimpleTextEditor;
