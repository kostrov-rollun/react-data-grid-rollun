import React from 'react';
import PropTypes from 'prop-types';

import CellMask from './CellMask';

function DragMask({ draggedPosition, getSelectedDimensions }) {
  const { overCellIdx, idx, rowIdx } = draggedPosition;
  if (overCellIdx != null && idx !== overCellIdx) {
    const isDraggedOverRight = idx < overCellIdx;
    const startCellIdx = isDraggedOverRight ? idx + 1 : overCellIdx;
    const endCellIdx = isDraggedOverRight ? overCellIdx : idx - 1;
    const className = isDraggedOverRight ? 'react-grid-cell-dragged-over-right' : 'react-grid-cell-dragged-over-left';

    const dimensions = getSelectedDimensions({ idx: startCellIdx, rowIdx });
    for (let currentCellIdx = startCellIdx + 1; currentCellIdx <= endCellIdx; currentCellIdx++) {
      const { width } = getSelectedDimensions({ idx: currentCellIdx, rowIdx });
      dimensions.width += width;
    }

    return (
      <CellMask
        {...dimensions}
        className={className}
      />
    );
  }
  return null;
}

DragMask.propTypes = {
  draggedPosition: PropTypes.object.isRequired,
  getSelectedDimensions: PropTypes.func.isRequired
};

export default DragMask;
