import PropTypes from 'prop-types';

import { DEFINE_SORT } from '../cells/headerCells/SortableHeaderCell';

const SortItemShape = PropTypes.shape({
  column: PropTypes.string,
  direction: PropTypes.oneOf(Object.keys(DEFINE_SORT))
});

const SortDataShape = PropTypes.arrayOf(SortItemShape);

export default SortDataShape;
