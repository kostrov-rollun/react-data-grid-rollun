import React from 'react';
import shallowEqual from 'shallowequal';
import BaseHeaderCell from './HeaderCell';
import getScrollbarSize from './getScrollbarSize';
import { isFrozen } from './ColumnUtils';
import SortableHeaderCell from 'common/cells/headerCells/SortableHeaderCell';
import FilterableHeaderCell from 'common/cells/headerCells/FilterableHeaderCell';
import HeaderCellType from './HeaderCellType';
import { HeaderRowType } from 'common/constants';
import SortDataShape from 'common/prop-shapes/SortDataShape';
import areSortArraysEqual from './utils/areSortArraysEqual';
import '../../../themes/react-data-grid-header.css';

import PropTypes from 'prop-types';

const HeaderRowStyle = {
  overflow: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.number,
  position: PropTypes.string
};

class HeaderRow extends React.Component {
  static displayName = 'HeaderRow';

  static propTypes = {
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.number.isRequired,
    columns: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    onColumnResize: PropTypes.func,
    onSort: PropTypes.func.isRequired,
    onColumnResizeEnd: PropTypes.func,
    style: PropTypes.shape(HeaderRowStyle),
    sortColumn: PropTypes.string,
    sortDirection: PropTypes.oneOf(Object.keys(SortableHeaderCell.DEFINE_SORT)),
    sort: SortDataShape,
    cellRenderer: PropTypes.func,
    headerCellRenderer: PropTypes.func,
    filterable: PropTypes.bool,
    onFilterChange: PropTypes.func,
    resizing: PropTypes.object,
    onScroll: PropTypes.func,
    rowType: PropTypes.string,
    draggableHeaderCell: PropTypes.func,
    onHeaderDrop: PropTypes.func
  };

  cells = new Map();

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.width !== this.props.width
      || nextProps.height !== this.props.height
      || nextProps.columns !== this.props.columns
      || !shallowEqual(nextProps.style, this.props.style)
      || !areSortArraysEqual(nextProps.sort, this.props.sort)
      || this.props.sortColumn !== nextProps.sortColumn
      || this.props.sortDirection !== nextProps.sortDirection
    );
  }

  getHeaderCellType = (column) => {
    if (column.filterable) {
      if (this.props.filterable) return HeaderCellType.FILTERABLE;
    }

    if (column.sortable && column.rowType !== HeaderRowType.FILTER) return HeaderCellType.SORTABLE;

    return HeaderCellType.NONE;
  };

  getFilterableHeaderCell = (column) => {
    let FilterRenderer = FilterableHeaderCell;
    if (column.filterRenderer !== undefined) {
      FilterRenderer = column.filterRenderer;
    }
    return <FilterRenderer {...this.props} onChange={this.props.onFilterChange} />;
  };

  getSortableHeaderCell = (column) => {
    const sortDescendingFirst = (column.sortDescendingFirst === undefined) ? false : column.sortDescendingFirst;

    let sortDirection;
    if (this.props.sort) {
      const columnSort = this.props.sort.filter((s) => s.column === column.key)[0];
      sortDirection = columnSort ? columnSort.direction : SortableHeaderCell.DEFINE_SORT.NONE;
    } else {
      sortDirection = (this.props.sortColumn === column.key) ? this.props.sortDirection : SortableHeaderCell.DEFINE_SORT.NONE;
    }

    return <SortableHeaderCell columnKey={column.key} onSort={this.props.onSort} sortDirection={sortDirection} sortDescendingFirst={sortDescendingFirst} headerRenderer={column.headerRenderer} />;
  };

  getHeaderRenderer = (column) => {
    if (column.headerRenderer && !column.sortable && !this.props.filterable) {
      return column.headerRenderer;
    }
    const headerCellType = this.getHeaderCellType(column);
    switch (headerCellType) {
    case HeaderCellType.SORTABLE:
      return this.getSortableHeaderCell(column);
    case HeaderCellType.FILTERABLE:
      return this.getFilterableHeaderCell(column);
    default:
      return undefined;
    }
  };

  getCells = () => {
    const cells = [];
    const frozenCells = [];
    const { columns, rowType } = this.props;

    for (let i = 0, len = columns.length; i < len; i++) {
      const column = columns[i];
      const { key } = column;
      const _renderer = key === 'select-row' && rowType === HeaderRowType.FILTER ? <div /> : this.getHeaderRenderer(column);

      const cell = (
        <BaseHeaderCell
          key={key}
          ref={(node) => node ? this.cells.set(key, node) : this.cells.delete(key)}
          column={column}
          rowType={rowType}
          height={this.props.height}
          renderer={_renderer}
          resizing={this.props.resizing === column}
          onResize={this.props.onColumnResize}
          onResizeEnd={this.props.onColumnResizeEnd}
          onHeaderDrop={this.props.onHeaderDrop}
          draggableHeaderCell={this.props.draggableHeaderCell}
        />
      );

      if (isFrozen(column)) {
        frozenCells.push(cell);
      } else {
        cells.push(cell);
      }
    }

    return cells.concat(frozenCells);
  };

  setScrollLeft = (scrollLeft) => {
    this.props.columns.forEach((column) => {
      const { key } = column;

      if (!this.cells.has(key)) return;

      const cell = this.cells.get(key);

      if (isFrozen(column)) {
        cell.setScrollLeft(scrollLeft);
      } else {
        cell.removeScroll();
      }
    });
  };

  render() {
    const { width, height, style, onScroll } = this.props;
    const cellsStyle = {
      width: width ? (width + getScrollbarSize()) : '100%',
      height: height,
      whiteSpace: 'nowrap',
      overflowX: 'hidden',
      overflowY: 'hidden'
    };

    return (
      <div
        style={style}
        onScroll={onScroll}
        className="react-grid-HeaderRow"
      >
        <div style={cellsStyle}>
          {this.getCells()}
        </div>
      </div>
    );
  }
}

module.exports = HeaderRow;
