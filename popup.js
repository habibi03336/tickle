import { readData, setData, getCurrentTab } from './chrome.js'

const $title = document.querySelector('#title');
const $content = document.querySelector('#content');
const $refAddbutton = document.querySelector('#refButton');
const $refList = document.querySelector('#refList');
const $saveButton = document.querySelector('#saveButton');
const $resetButton = document.querySelector('#resetButton');

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
    $content.style.height = $content.scrollHeight + 'px';
    $refList.innerHTML = '';
    Array.isArray(refs) ? refs.forEach(elem => { appendRefsLi(elem); }) : false;
}

function appendRefsLi(url_){
    const url = new URL(url_);
    const $li = document.createElement('div');
    const $url = document.createElement('a');
    $url.append(document.createTextNode(url.hostname+url.pathname));
    $url.href = url;
    const $removeButton = document.createElement('span');
    $removeButton.appendChild(document.createTextNode('X'));
    $removeButton.id = 'refRemoveButton';
    $removeButton.key = url.href;

    $li.append(
        $url,
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
    if ($content.scrollHeight > Number($content.style.height.slice(0,-2))){
        $content.style.height = $content.scrollHeight + 'px';
    }
});

$refAddbutton.addEventListener('click', async function(e) {
    let refs, tab;
    [refs, tab] = await Promise.all([readData('refs'), getCurrentTab()]);
    console.log(refs);
    if (!refs) refs = [tab.url] 
    else if (refs.findIndex((elem) => elem === tab.url) === -1) refs.push(tab.url) ;
    else return;

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
    let date = new Date();
    date = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    const fileHandle = await window.showSaveFilePicker({
        suggestedName: date + `-${await readData('title')}.md`,
        types: [{
          description: 'Markdown',
          accept: {
            'text/markdown': ['.md'],
          },
        }],
      });
    const fileStream = await fileHandle.createWritable();
    let fileContent = '---\n';
    fileContent += `title: ${await readData('title')} \n`;
    fileContent += `date: ${date}\n`
    fileContent += '---\n';
    fileContent += `${await readData('content')} \n`;
    const refs = await readData('refs');
    if (refs) {
        fileContent += '### Reference \n';
        refs.forEach((ref, idx) => fileContent += `${idx+1}. ${ref} \n`);
    }
    await fileStream.write(new Blob([fileContent], {type: "text/plain"}));
    await fileStream.close();
    init();
})

$resetButton.addEventListener('click', function(){
    if(window.confirm('reset all?')){
        init();
    }
})