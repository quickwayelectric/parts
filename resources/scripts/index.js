/*TODO:
* figure out how modals work
* add custom parts
* implement clipboard functions
* implement email function
* implement updating of part data
*/



/****Global Variables****/
var searchInput = document.getElementById('searchInput');
var searchList = document.getElementById('searchList');
var myTable = document.getElementById('myTable');
var listContainer = document.getElementById('myList-container');
var tableButtons = document.getElementById('table-buttons');
var customPartButton = document.getElementById('custom-part')
var copyPartsButton = document.getElementById('copy-parts');
var copyTableForEmailButton = document.getElementById('copy-table-for-email');
var copyTableForExcelButton = document.getElementById('copy-table-for-excel');
var clearTableButton = document.getElementById('clear-table');
var updatedDateDiv = document.getElementById('updated-date');
var dummyDiv = document.getElementById('dummy');
var myList = [];
var data = partsdata[0];
var searchListIndex = -1;
var modalContainer = document.getElementById('modal-container');
var submitModal = document.getElementById('submit-modal');
var closeModal = document.querySelector('.close-modal');
/****Function Declarations****/
var numberWithCommas = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

var search = (arr) => data.filter(el => RegExp('(?=.*' + arr.join(')(?=.*') + ').+', 'ig').test(el.stringView)).map(el => ({part: el.record, stringView: el.stringView, unit: el.unit}));
var findPart = (partNum) => data[data.findIndex(item => item.record == partNum)];
var saveData = () => localStorage.setItem('myList', JSON.stringify(myList));
var readStorage = () => {
    const storage = JSON.parse(localStorage.getItem('myList'));
    if(storage) myList = storage;
}

var addToList = (part) => {part.qty = 1; myList.push(part); saveData()};
var addToTable = (part, index) => {
    var tableData = `<tr>
                        <td class="close"><span>&times</span></td>
                        <td class="partNum al-left">${part.record? part.record: ''}</td>
                        <td class="desc al-left"><a href=https://www.google.com/search?tbm=isch&q=${part.manufacturer.replace(/[^a-zA-Z\d+]/g, '+')}+${part.manPartNum.replace(/[^a-zA-Z\d+]/g, '+')} target="_blank">${part.partDesc}<a></td>
                        <td class="unit al-left">${part.unit}</td>
                        <td class="qty al-right table-qty"><input type="number" min="0" id="row-${index}-qty"value="${part.qty}" class="qty-input tabbable-when-modal-hidden"></td>
                    </tr>`;
    listContainer.classList.contains('hidden')? listContainer.classList.toggle('hidden'): undefined;
    tableButtons.classList.contains('hidden')? tableButtons.classList.toggle('hidden'): undefined;
    myTable.querySelector('tbody').insertAdjacentHTML('beforeend',tableData);
}

var updateListQty = (myListItemIndex, qty) => {
    myList[myListItemIndex].qty = qty;
}
var renderMyList = () =>{
    myTable.querySelector('tbody').innerHTML=`
            <tr>
            <th class="close-header"></th>
            <th class="part-header al-left">Part#</th>
            <th class="description-header al-left">Description</th>
            <th class="unit-header al-left">Unit</th>
            <th class="quantity-header al-right">Quantity</th>
        </tr>`;
    if(myList.length > 0){
        myList.forEach((val, index) => addToTable(val, index));
    } else {
        listContainer.classList.add('hidden');
        tableButtons.classList.add('hidden');
    }
}
var renderResults = (arr) => {
    var searchListItems = '';
    arr.forEach((el, i)=>{
        searchListItems += `<li class="part" id="${el.part}" data="${i}">${el.stringView}</li>`
    });
    searchInput.val ===''? searchList.innerHTML='': searchList.innerHTML = searchListItems;
    searchListIndex = -1;
}

var clearResults = () =>{
    searchInput.value = '';
    searchList.innerHTML = '';
    searchListIndex = -1;
}

var selectEl = (partNum) =>{
    return document.getElementById(partNum);
}

function nextSearchIndex(oldIndex, maxIndex){
    if(oldIndex === maxIndex){
         return 0;
     } 
    oldIndex++;
    return oldIndex;
}

function previousSearchIndex(oldIndex, maxIndex){
    if(oldIndex === -1){
        return maxIndex;
    } 
   oldIndex--
   return oldIndex;
}

function renderSelection(ind){
    el = document.querySelector(`[data='${ind}']`)
    if(document.querySelector('.current-selection')){
        document.querySelector('.current-selection').classList.remove('current-selection');
    }
    if(ind !== -1){
        el.classList.add('current-selection');
        el.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
    }
}

var copyData = (str)=>{
    var el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);   
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert('Copied!');
}

function nextTab(target){
    if(modalContainer.classList.contains('hidden')){
        tabIndex = Array.from(document.querySelectorAll('.tabbable-when-modal-hidden'));
        tabNodeList = document.querySelectorAll('.tabbable-when-modal-hidden');
    } else {
        tabIndex = Array.from(document.querySelectorAll('.tabbable-when-modal-visible'))
        tabNodeList = document.querySelectorAll('.tabbable-when-modal-visible');
    }
    currentIndex = tabIndex.indexOf(target);
    if(currentIndex === tabIndex.length - 1 && target.id !== 'submit-modal'){
        document.getElementById(tabIndex[0].id).select();
    } else if(tabNodeList[currentIndex + 1].id === 'submit-modal'){
        console.log('This was the event');
        currentIndex++;
        tabNodeList[currentIndex].focus();
    }
    else {
        currentIndex++;
        tabNodeList[currentIndex].select();
    }

}

var clearModal = () => {
    document.getElementById('custom-manufacturer').value = '';
    document.getElementById('custom-part-number').value = '';
    document.getElementById('custom-part-description').value = '';
    document.getElementById('custom-units').value = '';
    document.getElementById('custom-quantity').value = '';
}

/****Event Listeners & Setup ****/
readStorage();

renderMyList();

updatedDateDiv.innerHTML = `<p>Last Updated ${lastUpdateDate}</p>`;

searchInput.addEventListener('keyup', function(event){
    var searchArr = searchInput.value.split(' ');
    var results = search(searchArr);
    var key = event.which;
    
    //backspace or escape
    if(searchInput.value === '' || key == 27){
        clearResults();
    }
    //down or right arrows
    else if(key == 40 || key == 39){
        searchListIndex = nextSearchIndex(searchListIndex, results.length);
        renderSelection(searchListIndex);
    }
    //up or left arrows
    else if(key == 38 || key == 37){
        searchListIndex = previousSearchIndex(searchListIndex, results.length);
        renderSelection(searchListIndex);
    }
    //home key
    else if(key == 36){
        searchListIndex = 0;
        renderSelection(searchListIndex);
    }
    //end key
    else if(key == 35){
        searchListIndex = results.length - 1;
        renderSelection(searchListIndex);
    }
    //enter key
    else if(key == 13 && searchListIndex > -1){
        event.stopPropagation();
        addToList(findPart(results[searchListIndex].part));
        renderMyList();
        clearResults();
    }
    else {
        renderResults(results);
    }
});

window.addEventListener('keydown', (e)=>{
    if(e.target instanceof HTMLInputElement && e.which == 13 && !searchList.hasChildNodes()){
        nextTab(e.target);
        e.stopPropagation();
    }
});

modalContainer.addEventListener('keydown', (e) => {
    if(e.target instanceof HTMLInputElement && e.which == 13 && e.target.id !== 'custom-quantity' && e.target.id !== 'submit-modal'){
        e.stopPropagation();
        nextTab(e.target);
    }
    else if(e.target.id === 'custom-quantity' && e.which == 13){
        submitModal.focus();
        e.preventDefault();
        e.stopImmediatePropagation();
    }
})

searchInput.placeholder = `        Click to Search ${numberWithCommas(partsdata[0].length)} Parts`;

myTable.addEventListener('click', e =>{
    if(e.target instanceof HTMLSpanElement){
        e.stopPropagation();
        var clickedPart = e.target.parentNode.parentNode.querySelector('.partNum').innerText;
        e.target.parentNode.parentNode.parentNode.removeChild(e.target.parentNode.parentNode);
        myList.splice(myList.indexOf(clickedPart),1);
        saveData();
        if(myList.length === 0) {
            listContainer.classList.add('hidden');
            tableButtons.classList.add('hidden');
        }
    }
});

myTable.addEventListener('change', (e)=>{
    myList[e.target.parentNode.parentNode.rowIndex - 1].qty = document.getElementById(e.target.id).value;
    saveData();
});

searchList.addEventListener('click', e=>{
    if(e.target instanceof HTMLLIElement){
        var part = findPart(e.target.id);
        addToList(part);
        renderMyList();
        clearResults();
    }
});

copyPartsButton.addEventListener('click', ()=>{
    var partsString = myList.map(el => el.record).join('\n');
    copyData(partsString);
});

customPartButton.addEventListener('click', ()=>{
    modalContainer.classList.remove('hidden');
    document.getElementById('custom-manufacturer').focus();
})

submitModal.addEventListener('click', (e)=> {
    manufacturerName = document.getElementById('custom-manufacturer');
    manPart = document.getElementById('custom-part-number');
    description = document.getElementById('custom-part-description');
    custUnits = document.getElementById('custom-units')
    quantity = document.getElementById('custom-quantity');
    
    if(description.value === '' && custUnits.value === '' && quantity.value === ''){
        description.focus();
        e.stopImmediatePropagation();
        alert('Part Description, Units, and Quantity are required fields.')
    } else {
        newListEl = {
            manPartNum: manPart.value,
            manufacturer: manufacturerName.value,
            partDesc: description.value,
            qty: quantity.value,
            stringView: `[${manPart.value}] ${description.value}; ${manufacturerName.value}`,
            unit: custUnits.value
        }
        myList.push(newListEl);
        renderMyList();
        saveData();
        clearModal();
        modalContainer.classList.add('hidden');
        searchInput.focus();
    }
})

closeModal.addEventListener('click', () =>{
    clearModal();
    modalContainer.classList.add('hidden');
})

copyTableForEmailButton.addEventListener('click', ()=>{
    var partsString = myList.map(el => `${el.record? 'Sage Part# ' + el.record: 'Not Found In Sage'} - ${el.manufacturer} ${el.partDesc}:   ${el.qty} ${el.unit}`).join('\n');
    copyData(partsString);
})

copyTableForExcelButton.addEventListener('click', () => {
    var headers = 'Sage Part\tPart Description\tUnit\tQuantity\tManufacturer\tMan. Part Num\n'
    var partsString = myList.map(el => el.record + '\t' + el.partDesc + '\t' + el.unit + '\t' + el.qty + '\t' + el.manufacturer + '\t' + el.manPartNum).join('\n');
    copyData(headers + partsString);
})

clearTableButton.addEventListener('click', ()=>{
    var confirmDelete = window.confirm('The entire table will be deleted. Are you sure?');
    if(confirmDelete){
        myList = [];
        saveData();
        renderMyList();
    }
})
