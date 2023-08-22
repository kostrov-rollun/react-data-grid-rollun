import React from 'react';
import PropTypes from 'prop-types';
import joinClasses from 'classnames';
import Cell from './Cell';
import { isFrozen } from './ColumnUtils';
require('../../../themes/react-data-grid-row.css');

const DEFAULT_EXPANDABLE_OPTIONS = {};

class Row extends React.Component {
  static displayName = 'Row';

  static propTypes = {
    /** The height of the row in pixels */
    height: PropTypes.number.isRequired,
    /** Array of columns to render */
    columns: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    /** JS object represeting row data */
    row: PropTypes.object.isRequired,
    /** React component used to render cell content */
    cellRenderer: PropTypes.func,
    /** Object used to listen for cell events */
    cellMetaData: PropTypes.object,
    /** Determines whether row is selected or not */
    isSelected: PropTypes.bool,
    /** The index of the row in the grid */
    idx: PropTypes.number.isRequired,
    /** Array of all rows that have been expanded */
    expandedRows: PropTypes.arrayOf(PropTypes.object),
    /** Space separated list of extra css classes to apply to row */
    extraClasses: PropTypes.string,
    /** Will force an updatef to the row if true */
    forceUpdate: PropTypes.bool,
    /** */
    subRowDetails: PropTypes.object,
    /** Determines whether row is hovered or not */
    isRowHovered: PropTypes.bool,
    /** The index of the first visible column on the grid */
    colVisibleStartIdx: PropTypes.number.isRequired,
    /** The index of the last visible column on the grid */
    colVisibleEndIdx: PropTypes.number.isRequired,
    /** The index of the first overscan column on the grid */
    colOverscanStartIdx: PropTypes.number.isRequired,
    /** The index of the last overscan column on the grid */
    colOverscanEndIdx: PropTypes.number.isRequired,
    /** Flag to determine whether the grid is being scrolled */
    isScrolling: PropTypes.bool.isRequired,
    /** scrollLeft in pixels */
    scrollLeft: PropTypes.number,
    /** Index of last frozen column index */
    lastFrozenColumnIndex: PropTypes.number
  };

  static defaultProps = {
    cellRenderer: Cell,
    isSelected: false,
    height: 35
  };

  cells = new Map();

  getCell = (column) => {
    const CellRenderer = this.props.cellRenderer;
    const { idx, cellMetaData, isScrolling, row, isSelected, scrollLeft, lastFrozenColumnIndex } = this.props;
    const { key, formatter } = column;

    const cellProps = {
      ref: (cell) => cell ? this.cells.set(key, cell) : this.cells.delete(key),
      idx: column.idx,
      rowIdx: idx,
      height: this.getRowHeight(),
      column,
      cellMetaData,
      value: this.getCellValue(key || column.idx),
      rowData: row,
      isRowSelected: isSelected,
      expandableOptions: this.getExpandableOptions(key),
      formatter,
      isScrolling,
      scrollLeft,
      lastFrozenColumnIndex
    };

    return <CellRenderer key={`${key}-${idx}`} {...cellProps} />;
  };

  getCells = () => {
    const { colOverscanStartIdx, colOverscanEndIdx, columns } = this.props;
    const frozenColumns = columns.filter(isFrozen);
    const nonFrozenColumns = columns.slice(colOverscanStartIdx, colOverscanEndIdx + 1).filter(c => !isFrozen(c));
    return nonFrozenColumns.concat(frozenColumns)
      .map(this.getCell);
  };

  getRowTop = () => {
    if (this.row) {
      return this.row.offsetTop;
    }

    return 0;
  };

  getRowHeight = () => {
    const rows = this.props.expandedRows || null;
    if (rows && this.props.idx) {
      const row = rows[this.props.idx] || null;
      if (row) {
        return row.height;
      }
    }
    return this.props.height;
  };

  getCellValue = (key) => {
    let val;
    if (key === 'select-row') {
      return this.props.isSelected;
    } else if (typeof this.props.row.get === 'function') {
      val = this.props.row.get(key);
    } else {
      val = this.props.row[key];
    }
    return val;
  };

  getExpandableOptions = (columnKey) => {
    const subRowDetails = this.props.subRowDetails;
    if (subRowDetails) {
      return { canExpand: subRowDetails && subRowDetails.field === columnKey && ((subRowDetails.children && subRowDetails.children.length > 0) || subRowDetails.group === true), field: subRowDetails.field, expanded: subRowDetails && subRowDetails.expanded, children: subRowDetails && subRowDetails.children, treeDepth: subRowDetails ? subRowDetails.treeDepth : 0, subRowDetails: subRowDetails };
    }
    return DEFAULT_EXPANDABLE_OPTIONS;
  };

  setScrollLeft = (scrollLeft) => {
    this.props.columns.forEach((column) => {
      const { key } = column;
      if (isFrozen(column) && this.cells.has(key)) {
        this.cells.get(key).setScrollLeft(scrollLeft);
      }
    });
  };

  setRowRef = el => {
    this.row = el;
  };

  render() {
    const className = joinClasses(
      'react-grid-Row',
      `react-grid-Row--${this.props.idx % 2 === 0 ? 'even' : 'odd'}`,
      this.props.isSelected && 'row-selected',
      this.props.extraClasses
    );

    const style = {
      height: this.getRowHeight(this.props),
      overflow: 'hidden'
    };

    return (
      <div
        ref={this.setRowRef}
        className={className}
        style={style}
      >
        {
          this.getCells()
        }
      </div >
    );
  }
}

export default Row;
