import React, { Component } from 'react';
import $ from 'jquery';
import Quill from 'quill';
import 'quill/dist/quill.core.css';
import './CustomFormats/CustomExpress';
import './CustomFormats/CustomImage';
import './CustomFormats/CustomLine';
import './CustomFormats/TextLink';

const data = {
  content: ''
};

let editor = null,
  rangePosition = 0;

class QuillEditor extends Component {
  componentDidMount() {
    const { content } = data;
    editor = new Quill('.quill-editor');
    editor.clipboard.dangerouslyPasteHTML(content, Quill.sources.SILENT); // 上次编辑的内容添加
    editor.focus();

    this.initJSHooks();

    $(document).on('click', '.ql-image', this.handleBrAfterNode);

    editor.on('editor-change', (eventName, ...args) => {
      if (eventName === 'text-change') {
        if (window.event && window.event.keyCode === 13) {
          setTimeout(() => {
            editor.format('bold', false);
          }, 0);

          window.ZKWJSBridge.invoke('keyboardEnter');
        }
      }
    });
  }

  initJSHooks() {
    // 插入图片
    window.jsHooks.insertPicture = (res) => {
      if (res.code === 200) {
        this.insertPic(res.data);
      }
    };
    // 上传图片
    window.jsHooks.uploadPicture = (res) => {
      this.uploadPic(res.data);
    };
    // 插入样式
    window.jsHooks.changeTextStyle = (res) => {
      if (res.code === 200) {
        this.changeStyle(res.data);
      }
    };
    // @用户
    window.jsHooks.insertUser = (res) => {
      if (res.code === 200) {
        this.insertUser(res.data);
      }
    };
    // 保存草稿
    window.jsHooks.getBody = () => {
      return this.getContent();
    };

    // 删除内容
    window.jsHooks.deleteText = () => {
      this.deleteText();
    };
  }

  insertPic(data) {
    console.log('insertPic');
    const { image, imgType } = data;
    if (imgType === 1) {
      image.map((item, index) => {
        const newData = {
          ...item,
          imgIndex: 0,
          style: 'opacity: 0.3',
          progressVisible: true
        };
        newData.imgIndex = rangePosition + index;
        editor.insertText(rangePosition++, '\n');
        editor.insertEmbed(rangePosition++, 'customimage', newData);
        editor.setSelection(rangePosition, Quill.sources.SILENT);
        window.ZKWJSBridge.invoke('keyboardEnter');
      });
    } else if (imgType === 0) {
      editor.insertEmbed(rangePosition++, 'expression', image);
    }
  }

  uploadPic(data) {
    console.log('uploadPic');
    const picId = data.id;
    const imgNode = document.querySelectorAll(`[data-imgid="${picId}"]`);
    const progressNode = document.querySelectorAll(`[data-progressid="${picId}"]`);
    const imgProgressNode = document.querySelectorAll(`[data-imgprogressid="${picId}"]`);
    if (data.finalId && data.finalId !== 0 && data.finalId !== -1) {
      Array.slice(imgNode).map((node, index) => {
        node.src = data.url;
        node.style.opacity = 1;
        node.setAttribute('data-file-center-id', data.finalId);
        progressNode[index].remove();
        imgProgressNode[index].remove();
      });
    } else if (data.finalId && data.finalId === -1) {
      Array.slice(imgNode).map((node, index) => {
        node.insertAdjacentHTML('afterEnd', '<div class="image-error"><div>上传失败</div><div>请删除图片重新上传</div></div>');
        progressNode[index].remove();
        imgProgressNode[index].remove();
      });
    } else {
      Array.slice(progressNode).map(node => {
        node.style.right = `${(65 - (data.progress / 3.3))}%`;
      });
    }
  }

  changeStyle(data) {
    const styleType = data.type;
    if (styleType === 0) {
      editor.format('bold', true);
    } else if (styleType === 1) {
      editor.format('bold', false);
    } else if (styleType === 2) {
      editor.formatLine(editor.getSelection().index, 1, 'header', 1);
    } else if (styleType === 3) {
      editor.formatLine(editor.getSelection().index, 1, 'header', 2);
    } else if (styleType === 4) {
      editor.formatLine(editor.getSelection().index, 1, 'header', 3);
    } else if (styleType === 5) {
      editor.format('bold', false);
      editor.formatLine(editor.getSelection().index, 1, 'header', false);
    } else if (styleType === 6) {
      if (editor.hasFocus()) {
        rangePosition = editor.getSelection().index;
      } else {
        editor.focus();
        this.movePageToCursor();
        window.ZKWJSBridge.invoke('focusOnEditor', {
          cursor: 'content'
        });
      }
      editor.insertEmbed(rangePosition, 'line', '');
      rangePosition = rangePosition + 2;
      editor.setSelection(rangePosition, Quill.sources.SILENT);
      editor.formatLine(rangePosition, 1, 'header', false);
      window.ZKWJSBridge.invoke('keyboardEnter');
    }
  }

  insertUser(data) {
    console.log('insertUser');
    editor.insertEmbed(rangePosition++, 'textlink', data);
    editor.setSelection(rangePosition, Quill.sources.SILENT);
    editor.insertText(rangePosition++, ' ');
  }

  getContent() {
    let content = '';
    if (editor.getLength() !== 1) {
      content = editor.container.firstChild.innerHTML;
    }
    const res = {
      content
    };
    if (/android/i.test(navigator.userAgent)) {
      return res;
    } else if (/iphone/i.test(navigator.userAgent)) {
      return JSON.stringify(res);
    }
  }

  deleteText() {
    console.log('deleteText');
    if (editor.hasFocus()) {
      if (editor.getSelection().index > 0) {
        editor.deleteText(editor.getSelection().index - 1, 1);
      }
    } else {
      if (rangePosition > 0) {
        editor.deleteText(rangePosition - 1, 1);
        rangePosition--;
      }
    }
  }

  /**
  * 当图片与分割线一起时，点击加入换行
  */
  handleBrAfterNode(event) {
    let targetNode;
    if (event.target.nodeName.toLowerCase() === 'img') {
      targetNode = event.target.parentNode;
    } else {
      targetNode = event.target;
    }
    const nextNode = targetNode.nextSibling;
    if (nextNode.className === 'ql-image' || nextNode.className === 'ql-line') {
      targetNode.insertAdjacentHTML('afterEnd', '<p><br></p>');
    }
  }

  /**
   * 页面移动到光标所在位置
   */
  movePageToCursor() {
    const sel = window.getSelection();
    if (sel.rangeCount <= 0) {
      editor.focus();
    } else {
      const range = sel.getRangeAt(0);
      const span = document.createElement('span');
      range.insertNode(span);
      document.body.scrollTop = span.offsetTop;
      span.parentNode.removeChild(span);
    }
  }

  render() {
    return (
      <div className="quill-editor" />
    );
  }
}

export default QuillEditor;