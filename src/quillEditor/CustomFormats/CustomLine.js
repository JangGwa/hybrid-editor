import Quill from 'quill';

// const Block = Quill.import('blots/block');
const BlockEmbed = Quill.import('blots/block/embed');
const LINE_ATTRIBUTES = [
  'style'
];

class Line extends BlockEmbed {
  constructor(domNode, value) {
    super(domNode, value);
    // domNode.setAttribute('style', 'margin-top: 30px');
    domNode.setAttribute('contenteditable', 'false');
  }
  static formats(domNode) {
    return LINE_ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (LINE_ATTRIBUTES.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

Line.blotName = 'line';
Line.className = 'ql-line';
Line.tagName = 'div';

Quill.register(Line);
