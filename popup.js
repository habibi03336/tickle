import { readData, setData, getCurrentTab } from './chrome.js'
import { debounce } from './scrooge.js';

const $refAddbutton = document.querySelector('#refButton');
const $refList = document.querySelector('#refList');
const $resetButton = document.querySelector('#resetButton');

function init(){
    setData('refIdxs', []);
    data2UI();
}

async function data2UI(){
    let refIdxs = await readData('refIdxs');
    $refList.innerHTML = '';
    
    if (refIdxs.length === 0) return;

    for (let idx of refIdxs)
    {
        let refInfo = await readData('ref' + String(idx))
        appendRefsLi(idx, refInfo);
    }
}

function appendRefsLi(idx, data){
    const url = new URL(data.url);
    const $name = document.createElement('input');
    $name.value = data.name;
    $name.addEventListener('input', debounce(() => {
        data.name = $name.value;
        setData('ref'+String(idx), data);
    }, 100));
    const $li = document.createElement('div');
    $li.classList += 'refList';
    const $url = document.createElement('a');
    $url.append(document.createTextNode(url.hostname+url.pathname));
    $url.href = url;
    $url.target = '_blank';
    const $removeButton = document.createElement('span');
    $removeButton.appendChild(document.createTextNode('X'));
    $removeButton.id = 'refRemoveButton';
    $removeButton.key = idx;

    $li.append(
        $name,
        $url,
        $removeButton
    );
    
    $refList.appendChild($li);
}

data2UI();

///**************** add events handlers ***************///

$refAddbutton.addEventListener('click', async function(e) {
    let refIdxs, tab;
    [refIdxs, tab] = await Promise.all([readData('refIdxs'), getCurrentTab()]);
    if (refIdxs.length === 0) refIdxs = [0]; 
    else refIdxs.push(refIdxs[refIdxs.length-1] + 1);

    let refName = 'ref' + String(refIdxs[refIdxs.length-1]);
    let newData = { name: '', url: tab.url };

    setData('refIdxs', refIdxs);
    setData(refName, newData);
    data2UI()
});

$refList.addEventListener('click', async function(e){
    if (e.target.id !== 'refRemoveButton') return;
    let refIdxs = await readData('refIdxs');
    refIdxs = refIdxs.filter(elem => elem !== e.target.key); 
    setData('refIdxs', refIdxs);
    data2UI();
});

$resetButton.addEventListener('click', function(){
    if(window.confirm('reset all?')){
        init();
    }
})