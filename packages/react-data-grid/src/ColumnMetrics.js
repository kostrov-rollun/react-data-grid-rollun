import sameColumn from './ColumnComparer';
import { isFrozen } from './ColumnUtils';
import getScrollbarSize from './getScrollbarSize';

function setColumnWidths(columns, totalWidth) {
  return columns.map(column => {
    const colInfo = { ...column };
    if (column.width) {
      if (/^([0-9]+)%$/.exec(column.width.toString())) {
        colInfo.width = Math.floor(
          column.width / 100 * totalWidth);
      }
    }
    return colInfo;
  });
}

function setDefferedColumnWidths(columns, unallocatedWidth, minColumnWidth) {
  const defferedColumns = columns.filter(c => !c.width);
  return columns.map((column) => {
    if (!column.width && column.width !== 0) {
      if (unallocatedWidth <= 0) {
        column.width = minColumnWidth;
      } else {
        const columnWidth = Math.floor(unallocatedWidth / defferedColumns.length);
        if (columnWidth < minColumnWidth) {
          column.width = minColumnWidth;
        } else {
          column.width = columnWidth;
        }
      }
    }
    return column;
  });
}

function setColumnOffsets(columns) {
  let left = 0;
  return columns.map(column => {
    column.left = left;
    left += column.width;
    return column;
  });
}

const getTotalColumnWidth = columns => columns.reduce((acc, c) => acc + (c.width || 0), 0);

function recalculate(metrics) {
  // compute width for columns which specify width
  let columns = setColumnWidths(metrics.columns, metrics.totalWidth);

  const width = getTotalColumnWidth(columns);
  const unallocatedWidth = metrics.totalWidth - width - getScrollbarSize();

  // compute width for columns which doesn't specify width
  columns = setDefferedColumnWidths(columns, unallocatedWidth, metrics.minColumnWidth);

  // compute left offset
  columns = setColumnOffsets(columns);
  const frozenColumns = columns.filter(isFrozen);
  const nonFrozenColumns = columns.filter(c => !isFrozen(c));
  columns = frozenColumns.concat(nonFrozenColumns).map((c, i) => {
    c.idx = i;
    return c;
  });
  return {
    columns,
    width,
    totalWidth: metrics.totalWidth,
    totalColumnWidth: getTotalColumnWidth(columns),
    minColumnWidth: metrics.minColumnWidth
  };
}

/**
 * Update column metrics calculation by resizing a column.
 *
 * @param {ColumnMetricsType} metrics
 * @param {Column} column
 * @param {number} width
 */
function resizeColumn(metrics, index, width) {
  const column = metrics.columns[index];
  const metricsClone = { ...metrics };
  metricsClone.columns = metrics.columns.slice(0);

  const updatedColumn = { ...column };
  updatedColumn.width = Math.max(width, metricsClone.minColumnWidth);

  metricsClone.columns.splice(index, 1, updatedColumn);

  return recalculate(metricsClone);
}

function compareEachColumn(prevColumns, nextColumns, isSameColumn) {
  let i;
  let len;
  let column;
  const prevColumnsByKey = Object.create(null);
  const nextColumnsByKey = Object.create(null);


  if (prevColumns.length !== nextColumns.length) {
    return false;
  }

  for (i = 0, len = prevColumns.length; i < len; i++) {
    column = prevColumns[i];
    prevColumnsByKey[column.key] = column;
  }

  for (i = 0, len = nextColumns.length; i < len; i++) {
    column = nextColumns[i];
    nextColumnsByKey[column.key] = column;
    const prevColumn = prevColumnsByKey[column.key];
    if (prevColumn === undefined || !isSameColumn(prevColumn, column)) {
      return false;
    }
  }

  for (i = 0, len = prevColumns.length; i < len; i++) {
    column = prevColumns[i];
    const nextColumn = nextColumnsByKey[column.key];
    if (nextColumn === undefined) {
      return false;
    }
  }
  return true;
}

function sameColumns(prevColumns, nextColumns, isSameColumn) {
  return compareEachColumn(prevColumns, nextColumns, isSameColumn);
}

module.exports = { recalculate, resizeColumn, sameColumn, sameColumns };
