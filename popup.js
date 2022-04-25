import { readData, setData, getCurrentTab } from './chrome.js'

const $title = document.querySelector('#title');
const $content = document.querySelector('#content');
const $refAddbutton = document.querySelector('#refButton');
const $refList = document.querySelector('#refList');
const $saveButton = document.querySelector('#saveButton');

function init(){
    setData('title', '');
    setData('content', '');
    setData('refs', []);
    data2UI();
}

async function data2UI(){
    let refs;
    [$title.value, $content.value, refs] = 
        await Promise.all([readData('title'), readData('content'), readData('refs')])
    $refList.innerHTML = '';
    Array.isArray(refs) ? refs.forEach(elem => { appendRefsLi(elem); }) : false;
}

function appendRefsLi(url){
    const $li = document.createElement('li');
    $li.appendChild(document.createTextNode(url));

    const $removeButton = document.createElement('button');
    $removeButton.appendChild(document.createTextNode('삭제'));
    $removeButton.id = 'refRemoveButton';
    $removeButton.key = url;

    $li.append(
        document.createTextNode(url),
        $removeButton
    );
    
    $refList.appendChild($li);
}

data2UI();

///**************** add events handlers ***************///

$title.addEventListener('input', function(e){
    setData('title', $title.value);
});

$content.addEventListener('input', function(e){
    setData('content', $content.value);
});

$refAddbutton.addEventListener('click', async function(e) {
    let refs, tab;
    [refs, tab] = await Promise.all([readData('refs'), getCurrentTab()]);
    
    if (!refs) refs = [tab.url] 
    else refs.push(tab.url);
    
    setData('refs', refs);
    data2UI()
});

$refList.addEventListener('click', async function(e){
    if (e.target.id !== 'refRemoveButton') return;
    let refs = await readData('refs');
    refs = refs.filter(elem => elem !== e.target.key); 
    setData('refs', refs);
    data2UI();
});

$saveButton.addEventListener('click', async function(){
    const fileHandle = await window.showSaveFilePicker({
        suggestedName: `${await readData('title')}.md`,
        types: [{
          description: 'Markdown',
          accept: {
            'text/markdown': ['.md'],
          },
        }],
      });
    const fileStream = await fileHandle.createWritable();
    await fileStream.write(new Blob([`${await readData('content')} \n`], {type: "text/plain"}));
    await fileStream.write(new Blob([`${await readData('refs')}`], {type: "text/plain"}));
    await fileStream.close();
    init();
})
