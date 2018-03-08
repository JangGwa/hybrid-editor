import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed');
const CUSTOM_IMAGE_ATTRIBUTES = [
  'src',
  'data-imgid',
  'data-file-center-id',
  'data-index',
  'style'
];

class CustomImage extends BlockEmbed {
  constructor(domNode, value) {
    super(domNode, value);
    domNode.setAttribute('contenteditable', 'false');
    const imgNode = document.createElement('img');
    const divNode = document.createElement('div');
    const progressNode = document.createElement('div');
    imgNode.setAttribute('src', value.url);
    imgNode.setAttribute('data-imgid', value.id);
    imgNode.setAttribute('data-index', value.imgIndex);
    imgNode.setAttribute('style', value.style);
    divNode.setAttribute('class', 'image-progress');
    divNode.setAttribute('data-imgprogressid', value.id);
    divNode.setAttribute('style', value.progressStyle);
    progressNode.setAttribute('style', value.progressVisible ? 'display: block;' : 'display: none;');
    progressNode.setAttribute('class', 'progress');
    progressNode.setAttribute('data-progressid', value.id);
    domNode.appendChild(imgNode);
    if (value.progressVisible) {
      domNode.appendChild(divNode);
      domNode.appendChild(progressNode);
    }
  }
  static value(domNode) {
    const src = domNode.childNodes[0].getAttribute('src');
    const imgId = domNode.childNodes[0].getAttribute('data-imgid');
    const indexId = domNode.childNodes[0].getAttribute('data-index');
    const fileCenterId = domNode.childNodes[0].getAttribute('data-file-center-id');
    const style = domNode.childNodes[0].getAttribute('style');
    const progressVisible = false;
    const data = {
      url: src,
      id: imgId,
      imgIndex: indexId,
      fileCenterId,
      style,
      progressVisible
    };
    return data;
  }
  static formats(domNode) {
    return CUSTOM_IMAGE_ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.childNodes[0].hasAttribute(attribute)) {
        formats[attribute] = domNode.childNodes[0].getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (CUSTOM_IMAGE_ATTRIBUTES.indexOf(name) > -1) {
      if (value) {
        this.domNode.childNodes[0].setAttribute(name, value);
      } else {
        this.domNode.childNodes[0].removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

CustomImage.blotName = 'customimage';
CustomImage.className = 'ql-image';
CustomImage.tagName = 'div';

Quill.register(CustomImage);
