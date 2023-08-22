import React from 'react';
import PropTypes from 'prop-types';
import joinClasses from 'classnames';
import { isFunction } from 'common/utils';
import SimpleCellFormatter from './formatters/SimpleCellFormatter';
import CellAction from './CellAction';
import CellExpand from './CellExpander';
import ChildRowDeleteButton from './ChildRowDeleteButton';
import { isFrozen, canEdit } from './ColumnUtils';
require('../../../themes/react-data-grid-cell.css');

const defaultCellContentStyle = {
  position: 'relative',
  top: '50%',
  transform: 'translateY(-50%)'
};
const SOURCE_COL = 'source';

class Cell extends React.PureComponent {
  static propTypes = {
    rowIdx: PropTypes.number.isRequired,
    idx: PropTypes.number.isRequired,
    isSelected: PropTypes.bool,
    wasPreviouslySelected: PropTypes.bool,
    isEditorEnabled: PropTypes.bool,
    selectedColumn: PropTypes.object,
    height: PropTypes.number,
    column: PropTypes.object.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object, PropTypes.bool]),
    isExpanded: PropTypes.bool,
    isRowSelected: PropTypes.bool,
    cellMetaData: PropTypes.object.isRequired,
    handleDragStart: PropTypes.func,
    className: PropTypes.string,
    cellControls: PropTypes.any,
    rowData: PropTypes.object.isRequired,
    forceUpdate: PropTypes.bool,
    expandableOptions: PropTypes.object.isRequired,
    tooltip: PropTypes.string,
    isScrolling: PropTypes.bool,
    isCellValueChanging: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]),
    scrollLeft: PropTypes.number.isRequired
  };

  static defaultProps = {
    isExpanded: false,
    value: '',
    isCellValueChanging: (value, nextValue) => value !== nextValue
  };

  state = {
    isCellValueChanging: false,
    isLockChanging: false
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      isCellValueChanging: this.props.isCellValueChanging(this.props.value, nextProps.value),
      isLockChanging: isFrozen(this.props.column) !== isFrozen(nextProps.column)
    });
  }

  componentDidMount() {
    this.checkScroll();
  }

  componentDidUpdate() {
    if (this.state.isLockChanging && !isFrozen(this.props.column)) {
      this.removeScroll();
    }
  }

  onCellClick = () => {
    const { idx, rowIdx, cellMetaData } = this.props;
    if (isFunction(cellMetaData.onCellClick)) {
      cellMetaData.onCellClick({ idx, rowIdx });
    }
  };

  onCellMouseDown = () => {
    const { idx, rowIdx, cellMetaData } = this.props;
    if (isFunction(cellMetaData.onCellMouseDown)) {
      cellMetaData.onCellMouseDown({ idx, rowIdx });
    }
  };

  onCellMouseEnter = () => {
    const { idx, rowIdx, cellMetaData } = this.props;
    if (isFunction(cellMetaData.onCellMouseEnter)) {
      cellMetaData.onCellMouseEnter({ idx, rowIdx });
    }
  };

  onCellContextMenu = () => {
    const { idx, rowIdx, cellMetaData } = this.props;
    if (isFunction(cellMetaData.onCellContextMenu)) {
      cellMetaData.onCellContextMenu({ idx, rowIdx });
    }
  };

  onCellDoubleClick = (e) => {
    e.stopPropagation();
    const { idx, rowIdx, cellMetaData } = this.props;
    if (isFunction(cellMetaData.onCellDoubleClick)) {
      cellMetaData.onCellDoubleClick({ idx, rowIdx });
    }
  };

  onCellExpand = (e) => {
    e.stopPropagation();
    const meta = this.props.cellMetaData;
    if (meta != null && meta.onCellExpand != null) {
      meta.onCellExpand({ rowIdx: this.props.rowIdx, idx: this.props.idx, rowData: this.props.rowData, expandArgs: this.props.expandableOptions });
    }
  };

  onCellKeyDown = (e) => {
    if (this.props.expandableOptions && this.props.expandableOptions.canExpand && e.key === 'Enter') {
      this.onCellExpand(e);
    }
  };

  onDeleteSubRow = () => {
    const meta = this.props.cellMetaData;
    if (meta != null && meta.onDeleteSubRow != null) {
      meta.onDeleteSubRow({ rowIdx: this.props.rowIdx, idx: this.props.idx, rowData: this.props.rowData, expandArgs: this.props.expandableOptions });
    }
  };

  handleDragEnter = (e) => {
    // Prevent default to allow drop
    e.preventDefault();
    const { column, rowData, cellMetaData } = this.props;

    if (column.areCellsDraggable && canEdit(column, rowData, cellMetaData.enableCellSelect)) {
      cellMetaData.onDragEnter({ overCellIdx: column.idx });
    }
  };

  handleDragOver = (e) => {
    e.dataTransfer.dropEffect = 'copy';
    e.preventDefault();
  };

  handleDrop = (e) => {
    // The default in Firefox is to treat data in dataTransfer as a URL and perform navigation on it, even if the data type used is 'text'
    // To bypass this, we need to capture and prevent the drop event.
    e.preventDefault();
  };

  getStyle = () => {
    return {
      position: 'absolute',
      width: this.props.column.width,
      height: this.props.height,
      left: this.props.column.left
    };
  };

  getRowData = (props = this.props) => {
    return props.rowData.toJSON ? props.rowData.toJSON() : props.rowData;
  };

  getCellClass = () => {
    const { idx, lastFrozenColumnIndex } = this.props;

    return joinClasses(
      this.props.column.cellClass,
      'react-grid-Cell',
      this.props.className,
      isFrozen(this.props.column) ? 'react-grid-Cell--frozen' : null,
      lastFrozenColumnIndex === idx ? 'rdg-last--frozen' : null,
      this.props.isRowSelected && 'row-selected',
      this.isEditorEnabled() && 'editing',
      this.props.tooltip ? 'has-tooltip' : null,
      this.props.expandableOptions && this.props.expandableOptions.subRowDetails && this.props.expandableOptions.treeDepth > 0 ? 'rdg-child-cell' : null,
      this.props.column.isLastColumn && 'last-column'
    );
  };

  getUpdateCellClass = () => {
    return this.props.column.getUpdateCellClass
      ? this.props.column.getUpdateCellClass(this.props.selectedColumn, this.props.column, this.state.isCellValueChanging)
      : '';
  };

  isEditorEnabled = () => {
    return this.props.isEditorEnabled === true;
  };

  checkScroll() {
    const { scrollLeft, column } = this.props;
    const node = this.node;
    if (isFrozen(column) && node && node.style.transform != null) {
      this.setScrollLeft(scrollLeft);
    }
  }

  setScrollLeft = (scrollLeft) => {
    const node = this.node;
    if (node) {
      node.style.transform = `translate3d(${scrollLeft}px, 0px, 0px)`;
    }
  };

  removeScroll = () => {
    const node = this.node;
    if (node) {
      node.style.transform = null;
    }
  };

  createColumEventCallBack = (onColumnEvent, info) => {
    return (e) => {
      onColumnEvent(e, info);
    };
  };

  createCellEventCallBack = (gridEvent, columnEvent) => {
    return (e) => {
      gridEvent(e);
      columnEvent(e);
    };
  };

  createEventDTO = (gridEvents, columnEvents, onColumnEvent) => {
    const allEvents = { ...gridEvents };

    for (const eventKey in columnEvents) {
      if (columnEvents.hasOwnProperty(eventKey)) {
        const eventInfo = { idx: this.props.idx, rowIdx: this.props.rowIdx, rowId: this.props.rowData[this.props.cellMetaData.rowKey], name: eventKey };
        const eventCallback = this.createColumEventCallBack(onColumnEvent, eventInfo);

        if (allEvents.hasOwnProperty(eventKey)) {
          const currentEvent = allEvents[eventKey];
          allEvents[eventKey] = this.createCellEventCallBack(currentEvent, eventCallback);
        } else {
          allEvents[eventKey] = eventCallback;
        }
      }
    }

    return allEvents;
  };

  getEvents = () => {
    const { column, cellMetaData } = this.props;
    const columnEvents = column.events;
    const onColumnEvent = cellMetaData ? cellMetaData.onColumnEvent : undefined;
    const gridEvents = {
      onClick: this.onCellClick,
      onMouseDown: this.onCellMouseDown,
      onMouseEnter: this.onCellMouseEnter,
      onDoubleClick: this.onCellDoubleClick,
      onContextMenu: this.onCellContextMenu,
      onDragEnter: this.handleDragEnter,
      onDragOver: this.handleDragOver,
      onDrop: this.handleDrop
    };

    if (!columnEvents || !onColumnEvent) {
      return gridEvents;
    }

    return this.createEventDTO(gridEvents, columnEvents, onColumnEvent);
  };

  getCellActions() {
    const { cellMetaData, column, rowData } = this.props;
    if (cellMetaData && cellMetaData.getCellActions) {
      const cellActionButtons = cellMetaData.getCellActions(column, rowData);
      if (cellActionButtons && cellActionButtons.length) {
        return cellActionButtons.map((action, index) => {
          return <CellAction key={index} action={action} isFirst={index === 0} />;
        });
      }
      return null;
    }
    return null;
  }

  setCellRef = (node) => {
    this.node = node;
  };

  renderCellContent = () => {
    const { value, column, rowIdx, rowData, isExpanded, isScrolling, expandableOptions } = this.props;
    let CellContent;
    const Formatter = column.formatter;
    if (React.isValidElement(Formatter)) {
      CellContent = React.cloneElement(Formatter, {
        value,
        column,
        rowIdx,
        isExpanded,
        isScrolling,
        row: this.getRowData()
      });
    } else if (isFunction(Formatter)) {
      CellContent = <Formatter value={value} column={column} rowIdx={rowIdx} isScrolling={isScrolling} row={this.getRowData()}/>;
    } else {
      CellContent = <SimpleCellFormatter value={value} />;
    }
    const isExpandCell = expandableOptions ? this.props.expandableOptions.field === column.key : false;
    const treeDepth = expandableOptions ? this.props.expandableOptions.treeDepth : 0;
    const marginLeft = expandableOptions && isExpandCell ? (expandableOptions.treeDepth * 30) : 0;

    const cellContentStyle = marginLeft ? {
      marginLeft,
      ...defaultCellContentStyle
    } : defaultCellContentStyle;

    let cellDeleter;

    const isDeleteSubRowEnabled = this.props.cellMetaData.onDeleteSubRow ? true : false;
    const hasReferralBid = this.props.rowData.referralBid !== null;
    const isBaseBid = this.props.rowData.isBaseBid === true;
    const showChildBidIndicator = (hasReferralBid || isBaseBid) && column.key === SOURCE_COL;

    if (showChildBidIndicator) {
      cellDeleter = <div className="rdg-child-row-action-cross-last" />;
    } else if (treeDepth > 0 && isExpandCell) {
      cellDeleter = <ChildRowDeleteButton treeDepth={treeDepth} cellHeight={this.props.height} siblingIndex={this.props.expandableOptions.subRowDetails.siblingIndex} numberSiblings={this.props.expandableOptions.subRowDetails.numberSiblings} onDeleteSubRow={this.onDeleteSubRow} isDeleteSubRowEnabled={isDeleteSubRowEnabled} />;
    }

    const tooltip = this.props.tooltip && (<span className="cell-tooltip-text">{this.props.tooltip}</span>);
    const classes = joinClasses('react-grid-Cell__value', this.props.tooltip ? 'cell-tooltip' : null);
    const cellContentClass = showChildBidIndicator ? 'rdg-child-row-offset' : undefined;

    return (
      <div className={classes}>
        {cellDeleter}
        <div style={cellContentStyle} className={cellContentClass}>
          <span>{CellContent}</span>
          {this.props.cellControls}
        </div>
        {tooltip}
      </div>
    );
  };

  render() {
    const { column, expandableOptions, children, 'data-testid': testId } = this.props;

    if (column.hidden) {
      return null;
    }

    const style = this.getStyle();
    const className = this.getCellClass();
    const cellActionButtons = this.getCellActions();
    const cellContent = children || this.renderCellContent();
    const events = this.getEvents();

    const cellExpander = expandableOptions && expandableOptions.canExpand && (
      <CellExpand expandableOptions={this.props.expandableOptions} onCellExpand={this.onCellExpand} />
    );

    return (
      <div
        className={className}
        style={style}
        data-testid={testId}
        {...events}
        ref={this.setCellRef}
      >
        {cellActionButtons}
        {cellExpander}
        {cellContent}
      </div>
    );
  }
}

export default Cell;
