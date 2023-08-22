import { SimpleTextEditor, CheckboxEditor } from 'common/editors';

const Editors = {
  AutoComplete: require('./AutoCompleteEditor'),
  DropDownEditor: require('./DropDownEditor'),
  SimpleTextEditor,
  CheckboxEditor
};

module.exports = Editors;
