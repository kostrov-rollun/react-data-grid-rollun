const RowUtils = {
  get: function(row, property) {
    if (typeof row.get === 'function') {
      return row.get(property);
    }

    return row[property];
  },
  isRowSelected(keys, indexes, isSelectedKey, rowData, rowIdx) {
    if (rowData && rowData.isBaseBid) {
      return false;
    }

    if (indexes && Array.isArray(indexes)) {
      return indexes.indexOf(rowIdx) > -1;
    } else if (keys && keys.rowKey && keys.values && Array.isArray(keys.values)) {
      return keys.values.indexOf(rowData[keys.rowKey]) > -1;
    } else if (isSelectedKey && rowData && typeof isSelectedKey === 'string') {
      return rowData[isSelectedKey];
    }
    return false;
  }
};

module.exports = RowUtils;
