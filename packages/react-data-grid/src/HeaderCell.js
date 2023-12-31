import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Column from 'common/prop-shapes/Column';
import { isFrozen } from './ColumnUtils';
import { HeaderRowType } from 'common/constants';
const ResizeHandle   = require('./ResizeHandle');

require('../../../themes/react-data-grid-header.css');

function SimpleCellRenderer({ column, rowType }) {
  const headerText = rowType === HeaderRowType.HEADER ? column.name : '';
  return <div className="widget-HeaderCell__value">{headerText}</div>;
}

class HeaderCell extends React.Component {
  static propTypes = {
    renderer: PropTypes.oneOfType([PropTypes.func, PropTypes.element]).isRequired,
    column: PropTypes.shape(Column).isRequired,
    rowType: PropTypes.string.isRequired,
    height: PropTypes.number.isRequired,
    onResize: PropTypes.func.isRequired,
    onResizeEnd: PropTypes.func.isRequired,
    onHeaderDrop: PropTypes.func,
    draggableHeaderCell: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
    className: PropTypes.string
  };

  static defaultProps = {
    renderer: SimpleCellRenderer
  };

  state = { resizing: false };

  headerCellRef = (node) => this.headerCell = node;

  onDragStart = (e) => {
    this.setState({ resizing: true });
    // need to set dummy data for FF
    if (e && e.dataTransfer && e.dataTransfer.setData) e.dataTransfer.setData('text/plain', 'dummy');
  };

  onDrag = (e) => {
    const resize = this.props.onResize || null; // for flows sake, doesnt recognise a null check direct
    if (resize) {
      const width = this.getWidthFromMouseEvent(e);
      if (width > 0) {
        resize(this.props.column, width);
      }
    }
  };

  onDragEnd = (e) => {
    const width = this.getWidthFromMouseEvent(e);
    this.props.onResizeEnd(this.props.column, width);
    this.setState({ resizing: false });
  };

  getWidthFromMouseEvent = (e) => {
    const right = e.pageX || (e.touches && e.touches[0] && e.touches[0].pageX) || (e.changedTouches && e.changedTouches[e.changedTouches.length - 1].pageX);
    const left = this.headerCell ? this.headerCell.getBoundingClientRect().left : 0;
    return right - left;
  };

  getCell = () => {
    const { height, column, rowType, renderer } = this.props;
    if (React.isValidElement(renderer)) {
      // if it is a string, it's an HTML element, and column is not a valid property, so only pass height
      if (typeof this.props.renderer.type === 'string') {
        return React.cloneElement(renderer, { height });
      }
      return React.cloneElement(renderer, { column, height });
    }
    return React.createElement(renderer, { column, rowType });
  };

  setScrollLeft = (scrollLeft) => {
    const node = this.headerCell;
    if (node) {
      node.style.transform = `translate3d(${scrollLeft}px, 0px, 0px)`;
    }
  };

  removeScroll = () => {
    const node = this.headerCell;
    if (node) {
      node.style.transform = null;
    }
  };

  render() {
    const { column, rowType } = this.props;
    const resizeHandle = column.resizable && (
      <ResizeHandle
        onDrag={this.onDrag}
        onDragStart={this.onDragStart}
        onDragEnd={this.onDragEnd}
      />
    );
    const className = classNames(
      'react-grid-HeaderCell',
      this.state.resizing && 'react-grid-HeaderCell--resizing',
      isFrozen(column) && 'react-grid-HeaderCell--frozen',
      this.props.className,
      column.cellClass
    );

    const style = {
      width: column.width,
      left: column.left,
      display: 'inline-block',
      position: 'absolute',
      height: this.props.height,
      margin: 0,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    };

    const cell = (
      <div ref={this.headerCellRef} data-testid={`headerCell-${column.key}`} className={className} style={style}>
        {this.getCell()}
        {resizeHandle}
      </div>
    );

    // if (rowType === HeaderRowType.HEADER && column.draggable) {
    //   const { draggableHeaderCell: DraggableHeaderCell } = this.props;
    //   return (
    //     <DraggableHeaderCell
    //       column={column}
    //       onHeaderDrop={this.props.onHeaderDrop}
    //     >
    //       {cell}
    //     </DraggableHeaderCell>
    //   );
    // }
    return cell;
  }
}

module.exports = HeaderCell;
