const voidTags = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
];

function convertHtml2JsonAndSet() {
  const htmlTextAreaValue = document.getElementById("html").value;
  const jsonObj = html2json(htmlTextAreaValue);
  const jsonArea = document.getElementById("json");
  jsonArea.textContent = JSON.stringify(jsonObj, null, 2);
}

function html2json(htmlText) {
  if (!htmlText || !htmlText.trim()) {
    return 'Incorrect input'
  };

  let root = [];
  let stack = [];
  let currentTagNode = null;
  let state = 'TEXT';
  let curData = '';
  let i = 0;

  function dataPush(data, type) {
    if (type === 'doctype') {
      if (stack.length > 0) {
        console.log(data)
        stack[stack.length -1].children.push(data);
      } else {
        root.push(data);
      }
    } else  if (type === 'children'){
      if (stack.length > 0) {
        stack[stack.length -1].children.push(data);
      } else {
        root.push(data);
      }
    } else if (type === 'attribute') {
      if (stack.length > 0) {
        stack[stack.length -1].attribute.push(data);
      }
    }
    
  };

  while (i < htmlText.length){
    const char = htmlText[i];
    const nextChar = htmlText[i + 1];
    const prevChar = htmlText[i - 1];

    switch (state) {
      case 'TEXT': 
        if (char === '<' && nextChar !== ' ') {
          console.log('Achieve <: ', curData.trim(), {type: curData});
          if (curData.trim()) {
            const textContent = curData.trim();
            dataPush(textContent, 'children');
          }
          curData = '';
          state = 'TAG_OPEN';
        } else if (nextChar == undefined){
          if (curData.trim()) {
            const textContent = `${curData + char}`.trim();
            dataPush(textContent, 'children');
          }
        } else {
          curData += char;
        }
        break;

      case 'COMMENT_OR_DOCTYPE': 
        if (char === '>' && curData[1] !== '-') {
          const commentData = curData.trim();
          const newComment = {
            doctype: commentData,
          };
          dataPush(newComment, 'doctype');
          state = 'TEXT';
          curData = '';
        } else if (char === '>' && prevChar === '-') {
          const commentData = curData.trim();
          const newComment = {
            comment: commentData,
          };
          dataPush(newComment, 'doctype');
          state = 'TEXT';
          curData = '';
        } else {
          curData += char;
        }
        break;
      
      case 'TAG_OPEN':
        if (char === '/'){
          state = 'CLOSE_TAG_NAME';
        } else if (char === '!'){
          state = 'COMMENT_OR_DOCTYPE';
          curData = char;
        } else if (char === '>') {
          const newNode = {
            tag: 'Fragment',
            attribute: [],
            children: [],
          };
          dataPush(newNode, 'children');
          stack.push(newNode);
          currentTagNode = newNode;
          state = 'TEXT';
          curData='';
        } else {
          state = 'TAG_NAME';
          curData = char;
        }
        break;

      case 'TAG_NAME':
        if (char === ' ' || char ==='\n') {
          const tagName = curData.trim();
          const isVoid = voidTags.includes(tagName.toLowerCase());

          const newNode = {
            tag: tagName,
            attribute: [],
            ...(isVoid ? {}: {children: []}),
          };

          dataPush(newNode, 'children');

          if (!isVoid) {
            stack.push(newNode);
          }
          currentTagNode = newNode;
          state = 'ATTRIBUTE_NAME';
          curData='';
        } else if (char === '>'){
          const tagName = curData.trim();
          const isVoid = voidTags.includes(tagName.toLowerCase());

          const newNode = {
            tag: tagName,
            attribute: [],
            ...(isVoid ? {}: {children: []}),
          };

          dataPush(newNode, 'children');

          if (!isVoid) {
            stack.push(newNode);
          };
          currentTagNode = newNode;
          state = 'TEXT';
          curData = '';
        } else if (char === '/' && nextChar === '>'){
          const tagName = curData.trim();
          const newNode = {
            tag: tagName,
            attribute: [],
          };
          dataPush(newNode, 'children');
          state = 'TEXT';
          curData = '';
        } else{
          curData += char;
        }
        break;
      
      case 'CLOSE_TAG_NAME':
        if (char === '>') {
          if(curData !== currentTagNode?.tag && stack.length){
            stack.pop();
          }
          stack.pop();
          curData = '';
          state = 'TEXT';
        } else {
          curData += char;
        }
        break;

      case 'ATTRIBUTE_NAME': 
       if (char === '=' && curData.trim()){
        const attribute = {
          attributeName: curData.trim(),
          attributeValue: '',
        };
        if (currentTagNode) {
          currentTagNode.attribute.push(attribute);
        }
        curData = '';
        state = 'ATTRIBUTE_VALUE';
       } else if (char === ' ' && curData.trim()){
        const attribute = {
          attributeName: curData.trim(),
          attributeValue: true,
        };
        if (currentTagNode) {
          currentTagNode.attribute.push(attribute);
        }
        curData = '';
        state = 'ATTRIBUTE_NAME';
       } else if ((char === '/' || char === ' ') && nextChar === '>'){
        curData = '';
        state = 'TEXT';
        i++;
       } else if (char === '>' && prevChar === '\n') {
        curData = '';
        state = 'TEXT';
       } else {
        curData += char;
       }
       break;

      case 'ATTRIBUTE_VALUE': 
        if (char === '>' && (prevChar === '`' || prevChar === '"' || prevChar === "'" || prevChar === '}')) {
          if (currentTagNode && currentTagNode.attribute.length > 0){
            const lastAttr = currentTagNode.attribute[currentTagNode.attribute.length - 1];
            lastAttr.attributeValue = curData.trim().replace(/^(['"``])(.*)\1$/, '$2');
          }
          state = 'TEXT';
          curData = '';
        } else if ((char === ' ' || char === '\n') && (prevChar === '`' || prevChar === '"' || prevChar === "'" || prevChar === '}')) {
          if (currentTagNode && currentTagNode.attribute.length > 0){
            const lastAttr = currentTagNode.attribute[currentTagNode.attribute.length - 1];
            lastAttr.attributeValue = curData.trim().replace(/^(['"``])(.*)\1$/, '$2');
          }
          state = 'ATTRIBUTE_NAME';
          curData = '';
        } else if (char === '\n' && nextChar === '>') {
          console.log('Hello')
        } else {
          curData += char;
        }
        break;
    }
    i++;
  }

  return root;
}



function showExample1() {
  const jsonContent = html2json(htmlExample1);
  document.getElementById("html").value = htmlExample1;
  document.getElementById("json").textContent = JSON.stringify(
    jsonContent,
    null,
    2
  );
}

function showExample2() {
  const jsonContent = html2json(htmlExample2);
  document.getElementById("html").value = htmlExample2;
  document.getElementById("json").textContent = JSON.stringify(
    jsonContent,
    null,
    2
  );
}

function clearTextArea() {
  document.getElementById("html").value = '';
  document.getElementById("json").textContent = '';
}
