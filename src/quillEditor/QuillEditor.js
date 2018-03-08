import React, { Component } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.core.css';
import './CustomFormats/CustomExpress';
import './CustomFormats/CustomImage';
import './CustomFormats/CustomLine';
import './CustomFormats/TextLink';

let editor = null,
  titleSync = '',
  rangePosition = 0,
  isBold = false,
  isHeader = false;

class QuillEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      titleBlur: false
    };
  }

  componentDidMount() {
    this.updateContent();
    this.initJSHooks();

    $(document).on('click', this.handleInputFocus.bind(this));

    $(document).on('click', '.ql-image', this.handleBrAfterNode);

    $(document).on('click', 'ql-line', this.handleBrAfterNode);

    editor.on('editor-change', (eventName, ...args) => {
      if (eventName === 'text-change') {
        if (window.event && window.event.keyCode === 13) {
          setTimeout(() => {
            editor.format('bold', false);
          }, 0);

          window.DXYJSBridge.invoke('keyboardEnter');
          isBold = false;
          isHeader = false;
        }
        this.updateCompleteStatus();
      }
    });

    if ($('.richtext-title').length > 0) {
      $('.richtext-title').on('input', (e) => {
        titleSync = e.currentTarget.innerText.trim();
        this.setState({
          title: titleSync
        }, () => {
          this.updateCompleteStatus();
        });
      });
    }

    this.props.updateLoadedState('bodyLoaded');
  }

  /**
     * 更新编辑器区域内容
     * @param {Object} documentData 编辑器内容数据
     * @param {Boolean} instantiated 是否已实例化
     */
  updateContent(documentData = this.props.documentData, instantiated = false) {
    const titleInputNode = document.querySelector('.richtext-title');
    const { editType, items: { content, title } } = documentData;

    if (!instantiated) {
      editor = new Quill('.richtext-content', {
        placeholder: editType === 0 ? '请提供尽量详细的病例信息、如患者性别和年龄，简要病史，检查、诊断和治疗（不少于4个字）' : '讨论正文（不少于4个字）'
      });
    }

    titleSync = title;

    editor.clipboard.dangerouslyPasteHTML(content, Quill.sources.SILENT); // 上次编辑的内容添加

    if (editType === 0 || editType === 2) {
      editor.focus();
    } else {
      titleInputNode.focus();
    }

    this.updateCompleteStatus();
    this.handleInputFocus();
  }

  /**
     * 更新编辑器完成状态
     */
  updateCompleteStatus() {
    const { editType } = this.props.documentData;
    const isTitleValidate = editType === 2 || titleSync.length > 3;
    const isContentValidate = editor.getLength() > 4 || document.querySelector('.ql-expression');

    window.DXYJSBridge.invoke('editorComplete', {
      isComplete: !!(isTitleValidate && isContentValidate)
    });
  }

  /**
   * 告诉 Native 当前被 focus 的元素
   */
  handleInputFocus() {
    if (document.activeElement === this.nameTitle) {
      window.DXYJSBridge.invoke('focusOnEditor', {
        cursor: 'title'
      });
    }

    if (document.activeElement === editor.container.firstChild) {
      window.DXYJSBridge.invoke('focusOnEditor', {
        cursor: 'content'
      });
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
    // focus
    window.jsHooks.focus = (res) => {
      if (res.code === 200) {
        this.focus(res.data);
      }
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
        window.DXYJSBridge.invoke('keyboardEnter');
        isBold = false;
        isHeader = false;
      });
    } else if (imgType === 0) {
      editor.insertEmbed(rangePosition++, 'expression', image);
      const isIOS = /iphone/i.test(navigator.userAgent);
      if (isBold && !isHeader && isIOS) {
        window.DXYJSBridge.invoke('keyboardEnter');
      }
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
        this.updateCompleteStatus();
      });
    } else if (data.finalId && data.finalId === -1) {
      Array.slice(imgNode).map((node, index) => {
        node.insertAdjacentHTML('afterEnd', '<div class="image-error"><div>上传失败</div><div>请删除图片重新上传</div></div>');
        progressNode[index].remove();
        imgProgressNode[index].remove();
        this.updateCompleteStatus();
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
      isBold = true;
    } else if (styleType === 1) {
      editor.format('bold', false);
      isBold = false;
    } else if (styleType === 2) {
      editor.formatLine(editor.getSelection().index, 1, 'header', 1);
      isHeader = true;
      isBold = false;
    } else if (styleType === 3) {
      editor.formatLine(editor.getSelection().index, 1, 'header', 2);
      isHeader = true;
      isBold = false;
    } else if (styleType === 4) {
      editor.formatLine(editor.getSelection().index, 1, 'header', 3);
      isHeader = true;
      isBold = false;
    } else if (styleType === 5) {
      editor.format('bold', false);
      editor.formatLine(editor.getSelection().index, 1, 'header', false);
      isBold = false;
      isHeader = false;
    } else if (styleType === 6) {
      if (editor.hasFocus()) {
        rangePosition = editor.getSelection().index;
      } else {
        editor.focus();
        this.movePageToCursor();
        window.DXYJSBridge.invoke('focusOnEditor', {
          cursor: 'content'
        });
      }
      editor.insertEmbed(rangePosition, 'line', '');
      rangePosition = rangePosition + 2;
      editor.setSelection(rangePosition, Quill.sources.SILENT);
      editor.formatLine(rangePosition, 1, 'header', false);
      window.DXYJSBridge.invoke('keyboardEnter');
      isBold = false;
      isHeader = false;
    }
  }

  insertUser(data) {
    console.log('insertUser');
    editor.insertEmbed(rangePosition++, 'textlink', data);
    editor.setSelection(rangePosition, Quill.sources.SILENT);
    editor.insertText(rangePosition++, ' ');
    const isIOS = /iphone/i.test(navigator.userAgent);
    if (isBold && !isHeader && isIOS) {
      window.DXYJSBridge.invoke('keyboardEnter');
    }
  }

  focus(data) {
    console.log('editorFocus', data);
    const titleInputNode = document.querySelector('.richtext-title');
    if (data.focus) {
      if (data.cursor === 'title') {
        titleInputNode.focus();
      } else {
        editor.setSelection(rangePosition, Quill.sources.SILENT);
        editor.focus();
        this.movePageToCursor();
      }
    } else {
      if (data.cursor === 'title') {
        titleInputNode.blur();
      } else {
        if (editor.hasFocus()) {
          rangePosition = editor.getSelection().index;
        }
        editor.blur();
      }
    }
    this.handleInputFocus();
  }

  getContent() {
    const { documentData } = this.props;
    const { editType } = documentData;
    let title = '';
    let content = '';
    if (editor.getLength() !== 1) {
      content = editor.container.firstChild.innerHTML;
    }
    if (editType !== 2) {
      try {
        title = $('.richtext-title').text();
      } catch (error) {
        console.log('', error);
      }
    }
    const res = {
      body: {
        title,
        content
      }
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