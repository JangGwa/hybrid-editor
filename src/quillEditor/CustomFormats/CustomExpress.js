import Quill from 'quill';

const Embed = Quill.import('blots/embed');
const EXPRESSION_ATTRIBUTES = [
  'src'
];

class Expression extends Embed {
  constructor(domNode, value) {
    super(domNode, value);
    domNode.setAttribute('src', value.url);
    domNode.setAttribute('style', 'width: 48px;');
  }
  static formats(domNode) {
    return EXPRESSION_ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (EXPRESSION_ATTRIBUTES.indexOf(name) > -1) {
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

Expression.blotName = 'expression';
Expression.className = 'ql-expression';
Expression.tagName = 'img';

Quill.register(Expression);
