import React from 'react';
import ReactDOM from 'react-dom';
import joinClasses from 'classnames';
import ColumnMetrics from './ColumnMetrics';
import HeaderRow from './HeaderRow';
import getScrollbarSize  from './getScrollbarSize';
import PropTypes from 'prop-types';
import cellMetaDataShape from 'common/prop-shapes/CellMetaDataShape';
import SortDataShape from 'common/prop-shapes/SortDataShape';
import { HeaderRowType } from 'common/constants';
import areSortArraysEqual from './utils/areSortArraysEqual';
require('../../../themes/react-data-grid-header.css');

class Header extends React.Component {
  static propTypes = {
    columnMetrics: PropTypes.shape({  width: PropTypes.number.isRequired, columns: PropTypes.any }).isRequired,
    totalWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.number.isRequired,
    headerRows: PropTypes.array.isRequired,
    sortColumn: PropTypes.string,
    sortDirection: PropTypes.oneOf(['ASC', 'DESC', 'NONE']),
    sort: SortDataShape,
    onSort: PropTypes.func,
    onColumnResize: PropTypes.func,
    onScroll: PropTypes.func,
    onHeaderDrop: PropTypes.func,
    draggableHeaderCell: PropTypes.func,
    getValidFilterValues: PropTypes.func,
    cellMetaData: PropTypes.shape(cellMetaDataShape)
  };

  state = { resizing: null };

  componentWillReceiveProps() {
    this.setState({ resizing: null });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const update =  !(ColumnMetrics.sameColumns(this.props.columnMetrics.columns, nextProps.columnMetrics.columns, ColumnMetrics.sameColumn))
    || this.props.totalWidth !== nextProps.totalWidth
    || (this.props.headerRows.length !== nextProps.headerRows.length)
    || (this.state.resizing !== nextState.resizing)
    || !areSortArraysEqual(nextProps.sort, this.props.sort)
    || this.props.sortColumn !== nextProps.sortColumn
    || this.props.sortDirection !== nextProps.sortDirection;
    return update;
  }

  onColumnResize = (column, width) => {
    const state = this.state.resizing || this.props;

    const pos = this.getColumnPosition(column);

    if (pos != null) {
      const resizing = {
        columnMetrics: { ...state.columnMetrics }
      };
      resizing.columnMetrics = ColumnMetrics.resizeColumn(
          resizing.columnMetrics, pos, width);

      // we don't want to influence scrollLeft while resizing
      if (resizing.columnMetrics.totalWidth < state.columnMetrics.totalWidth) {
        resizing.columnMetrics.totalWidth = state.columnMetrics.totalWidth;
      }

      resizing.column = resizing.columnMetrics.columns[pos];
      this.setState({ resizing });
    }
  };

  onColumnResizeEnd = (column, width) => {
    const pos = this.getColumnPosition(column);
    if (pos !== null && this.props.onColumnResize) {
      this.props.onColumnResize(pos, width || column.width);
    }
  };

  setRowRef = (row) => {
    this.row = row;
  };

  setFilterRowRef = (filterRow) => {
    this.filterRow = filterRow;
  };

  getHeaderRows = () => {
    const columnMetrics = this.getColumnMetrics();
    const resizeColumn = this.state.resizing ? this.state.resizing.column : undefined;

    return this.props.headerRows.map((row, index) => {
      // To allow header filters to be visible
      const isFilterRow = row.rowType === HeaderRowType.FILTER;
      const rowHeight = isFilterRow ? '500px' : 'auto';
      const scrollbarSize = getScrollbarSize() > 0 ? getScrollbarSize() : 0;
      const updatedWidth = isNaN(this.props.totalWidth - scrollbarSize) ? this.props.totalWidth : this.props.totalWidth - scrollbarSize;
      const headerRowStyle = {
        position: 'absolute',
        top: this.getCombinedHeaderHeights(index),
        left: 0,
        width: updatedWidth,
        overflowX: 'hidden',
        minHeight: rowHeight
      };

      return (
        <HeaderRow
          key={row.rowType}
          ref={isFilterRow ? this.setFilterRowRef : this.setRowRef}
          rowType={row.rowType}
          style={headerRowStyle}
          onColumnResize={this.onColumnResize}
          onColumnResizeEnd={this.onColumnResizeEnd}
          width={columnMetrics.width}
          height={row.height || this.props.height}
          columns={columnMetrics.columns}
          resizing={resizeColumn}
          draggableHeaderCell={this.props.draggableHeaderCell}
          filterable={row.filterable}
          onFilterChange={row.onFilterChange}
          onHeaderDrop={this.props.onHeaderDrop}
          sortColumn={this.props.sortColumn}
          sortDirection={this.props.sortDirection}
          sort={this.props.sort}
          onSort={this.props.onSort}
          onScroll={this.props.onScroll}
          getValidFilterValues={this.props.getValidFilterValues}
        />
      );
    });
  };

  getColumnMetrics = () => {
    if (this.state.resizing) {
      return this.state.resizing.columnMetrics;
    }
    return this.props.columnMetrics;
  };

  getColumnPosition = (column) => {
    const columnMetrics = this.getColumnMetrics();
    let pos = -1;
    columnMetrics.columns.forEach((c, idx) => {
      if (c.key === column.key) {
        pos = idx;
      }
    });
    return pos === -1 ? null : pos;
  };

  getCombinedHeaderHeights = (until) => {
    let stopAt = this.props.headerRows.length;
    if (typeof until !== 'undefined') {
      stopAt = until;
    }

    let height = 0;
    for (let index = 0; index < stopAt; index++) {
      height += this.props.headerRows[index].height || this.props.height;
    }
    return height;
  };

  setScrollLeft = (scrollLeft) => {
    const node = ReactDOM.findDOMNode(this.row);
    node.scrollLeft = scrollLeft;
    this.row.setScrollLeft(scrollLeft);
    if (this.filterRow) {
      const nodeFilters = ReactDOM.findDOMNode(this.filterRow);
      nodeFilters.scrollLeft = scrollLeft;
      this.filterRow.setScrollLeft(scrollLeft);
    }
  };

  // Set the cell selection to -1 x -1 when clicking on the header
  onHeaderClick = () => {
    this.props.cellMetaData.onCellClick({ rowIdx: -1, idx: -1 });
  };

  render() {
    const className = joinClasses(
      'react-grid-Header',
      !!this.state.resizing && 'react-grid-Header--resizing'
    );
    const headerRows = this.getHeaderRows();
    const { height, onScroll } = this.props;
    const style = {
      position: 'relative',
      height: this.getCombinedHeaderHeights()
    };

    return (
      <div onScroll={onScroll} style={style} className={className} onClick={this.onHeaderClick}>
        {headerRows}
      </div>
    );
  }
}

module.exports = Header;
