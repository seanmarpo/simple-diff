import CodeMirror from 'codemirror';
import * as Diff from 'diff';
import * as Diff2Html from 'diff2html/lib/ui/js/diff2html-ui';

import lzutf8 from 'lzutf8';

import 'codemirror/lib/codemirror.css';
import 'diff2html/bundles/css/diff2html.min.css';
import './index.css';

const [
  elemTextL,
  elemTextR,
  elemCompare,
  elemInline,
  elemDiff,
] = [
  'text1', 
  'text2',
  'compare',
  'inline',
  'diff',
].map(id => document.getElementById(id)!);

const [lEditor, rEditor] = [elemTextL, elemTextR]
  .map(e => CodeMirror(e, {lineNumbers: true}));

let [lText, rText] = ['', ''];

const updateText = () => {
  lText = lEditor.getValue();
  rText = rEditor.getValue();
};

// URL Hash Format
// Left Editor | Right Editor
// Ex: abc|def
const render = () => {
  try {
    // Save the current data into the URL hash
    if (lEditor.getValue() != '' || rEditor.getValue() != '') {
      const leftCompressed = lzutf8.compress(lEditor.getValue(), {outputEncoding: 'Base64'});
      const rightCompressed = lzutf8.compress(rEditor.getValue(), {outputEncoding: 'Base64'});
      window.location.hash = `${leftCompressed}|${rightCompressed}`;
    } else if (window.location.hash != '') {
      // Load the data from the URL hash
      const [lCompressed, rCompressed] = window.location.hash.split('#')[1].split('|');
      const lDecompressed = lzutf8.decompress(lCompressed, {inputEncoding: 'Base64'});
      const rDecompressed = lzutf8.decompress(rCompressed, {inputEncoding: 'Base64'});
      lEditor.setValue(lDecompressed);
      rEditor.setValue(rDecompressed);
      updateText();
    }
  } catch (error) {
    console.log('Error occurred when load/unloading data. Resetting URL hash');
    window.location.hash = '';
  }
  
  new Diff2Html.Diff2HtmlUI(elemDiff,
    Diff.createPatch('diff', lText, rText),
    {
      drawFileList: false,
      fileContentToggle: false,
      outputFormat: (<HTMLInputElement>elemInline).checked ? 'line-by-line' : 'side-by-side',
    },
  )
    .draw();
};

elemInline.addEventListener('click', render);
elemCompare.addEventListener('click', () => {
  updateText();
  render();
});

render();
