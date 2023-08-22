const React = require('react');
import PropTypes from 'prop-types';
require('../../../themes/react-data-grid-checkbox.css');

class CheckboxEditor extends React.Component {
  static propTypes = {
    value: PropTypes.bool,
    rowIdx: PropTypes.number,
    column: PropTypes.shape({
      key: PropTypes.string,
      onCellChange: PropTypes.func
    })
  };

  handleChange = (e) => {
    if (!this.props.row.isBaseBid) {
      this.props.column.onCellChange(this.props.rowIdx, this.props.column.key, this.props.row, e);
    }
  };

  render() {
    const checked = this.props.value != null ? this.props.value : false;
    const isDisabled = this.props.row.isBaseBid;
    const checkboxName = 'checkbox' + this.props.rowIdx;
    return (
      <div className="react-grid-checkbox-container checkbox-align" onClick={this.handleChange}>
          <input className="react-grid-checkbox" type="checkbox" name={checkboxName} checked={checked} readOnly disabled={isDisabled} />
          <label htmlFor={checkboxName} className="react-grid-checkbox-label"></label>
      </div>);
  }
}

module.exports = CheckboxEditor;
