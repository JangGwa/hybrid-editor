import Quill from 'quill';

const Embed = Quill.import('blots/embed');
const TEXT_LINK_ATTRIBUTES = [
  'href',
  'data-username'
];

class TextLink extends Embed {
  constructor(domNode, value) {
    super(domNode, value);
    domNode.setAttribute('class', 'textlink');
    domNode.setAttribute('href', value.link);
    domNode.setAttribute('data-username', value.username);
    domNode.innerHTML = value.username ? ` @${value.username} ` : '';
  }
  static value(domNode) {
    const username = domNode.getAttribute('data-username');
    const href = domNode.getAttribute('href');
    const data = {
      username,
      link: href
    };
    return data;
  }
  static formats(domNode) {
    return TEXT_LINK_ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (TEXT_LINK_ATTRIBUTES.indexOf(name) > -1) {
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


TextLink.blotName = 'textlink';
TextLink.className = 'ql-textlink';
TextLink.tagName = 'a';


Quill.register(TextLink);
