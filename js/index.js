const addProductButton = document.getElementById("add");
const saveChangesButton = document.getElementById("save");
const reloadButton = document.getElementById("reload");
const table = document.getElementById("table");
addProductButton.addEventListener("click", addItem);
saveChangesButton.addEventListener("click", checkChanges);
reloadButton.addEventListener("click", reload);
let products = {};
let APIKEY;

if (localStorage.getItem("api-key") !== null){
    APIKEY = localStorage.getItem("api-key");
}else{
    APIKEY = localStorage.setItem("api-key", "temp");
}

function connect(){
    const Http = new XMLHttpRequest();
    Http.open("GET", "https://api.samtipper.repl.co/check-key");
        Http.setRequestHeader("Content-Type", "application/json");
        Http.setRequestHeader("Api-Key", APIKEY);
        Http.send();
    return Http.response;
}

function onlyNumberKey(evt) {
    let ASCIICode = (evt.which) ? evt.which : evt.keyCode
    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
        return false;
    return true;
}

function productCount(){
    const Http = new XMLHttpRequest();
        Http.open("GET", "https://api.samtipper.repl.co/get");
        Http.setRequestHeader("Content-Type", "application/json");
        Http.setRequestHeader("Api-Key", APIKEY);
        Http.send();
        Http.onreadystatechange = function(){
            if (this.readyState === 4 && this.status === 200){
                document.getElementById('amount').innerHTML = `${Http.response} Unique Products!`;
            }
        }
}

function sendNewItems(){
    const Http = new XMLHttpRequest();
    Http.open("POST", "https://api.samtipper.repl.co/update-stock");
    Http.setRequestHeader("Content-Type", "application/json");
    Http.setRequestHeader("Api-Key", APIKEY);
    Http.send(JSON.stringify(products));
    Http.onreadystatechange = function(){
        if (this.readyState !== 4 && this.status === 200){
            saveChangesButton.disabled = false; addProductButton.disabled = false; reloadButton.disabled = false;
        }
    }
}

function checkChanges(){
    saveChangesButton.disabled = true; addProductButton.disabled = true; reloadButton.disabled = true;
    for (let i = 0, row; row = table.rows[i]; i++) {
        let items = [];
        for (let j = 0, col; col = row.cells[j]; j++) {
            if (table.rows[i].cells[j].innerHTML !== "Product" || table.rows[i].cells[j].innerHTML !== "Quantity"){
                items.push(table.rows[i].cells[j].innerHTML);
            }
        }
        products[items[0]] = items[1];
    }
    sendNewItems();
}
    
function addItems(items){
    let itemsObj = JSON.parse(items)
    for (const [key, value] of Object.entries(itemsObj)){
        const newRow = table.insertRow(table.length);
        const cell0 = newRow.insertCell(newRow.length);
        const cell1 = newRow.insertCell(newRow.length);
        cell0.innerHTML = key;
        cell1.innerHTML = value;
        cell1.setAttribute('contenteditable', true);
        if (value < 1){cell0.style = 'color: red;';}
        products[key] = value;
    }
    addProductButton.disabled = false; saveChangesButton.disabled = false; reloadButton.disabled = false;
}

function onLoad(){
    let found = false;
    productCount();
    const Http = new XMLHttpRequest();
    Http.open("GET", "https://api.samtipper.repl.co/stock-list");
    Http.setRequestHeader("Content-Type", "application/json");
    Http.setRequestHeader("Api-Key", APIKEY);
    Http.send();
    Http.onreadystatechange = function(){
        if (this.readyState === 4 && this.status === 200 && found === false && Http.response !== ""){
            found = true;
            addItems(Http.response);
        }
    }
}
    
function addTableRow(item){ 
    const newRow = table.insertRow(table.length);
    const cell0 = newRow.insertCell(newRow.length);
    const cell1 = newRow.insertCell(newRow.length);
    cell0.innerHTML = item.item;
    cell1.innerHTML = item.quantity;
    cell1.setAttribute('contenteditable', true);
    products[item.item] = item.quantity;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function addItem(event){
    if (document.getElementById('item').value.trim() !== "" && document.getElementById('quant').value.trim() !== ""){
        reloadButton.disabled = true; addProductButton.disabled = true; saveChangesButton.disabled = true;
        let itemAdded = false;
        let itemObj = {
            item: capitalizeFirstLetter(document.getElementById('item').value),
            quantity: document.getElementById('quant').value
        };
        let item = JSON.stringify(itemObj);

        const Http = new XMLHttpRequest();
        Http.open("POST", "https://api.samtipper.repl.co/add-item");
        Http.setRequestHeader("Content-Type", "application/json");
        Http.setRequestHeader("Api-Key", APIKEY);
        Http.send(item);
        Http.onreadystatechange = function(){
            if (this.readyState !== 4 && this.status !== 200){
                if (this.readyState !== 4 && this.status === 400 && itemAdded === false){
                    alert("Product already in database.");
                }else if (itemAdded === false){
                    alert("Cannot connect to server, please try again later.");
                }
                itemAdded = true;
                
            }else if(this.readyState !== 4 && this.status === 200 && itemAdded === false){
                document.getElementById('item').value = ""; document.getElementById('item').setAttribute('style', '-internal-light-dark(rgb(118, 118, 118), rgb(133, 133, 133));');
                document.getElementById("quant").value = ""; document.getElementById('quant').setAttribute('style', '-internal-light-dark(rgb(118, 118, 118), rgb(133, 133, 133));');
                addTableRow(itemObj);
                itemAdded = true;
                reloadButton.disabled = false; addProductButton.disabled = false; saveChangesButton.disabled = false;
            }
        }
    }else{
        if (document.getElementById('item').value.trim() === ""){
            document.getElementById('item').style.borderColor = "red";
        }else{
            document.getElementById('item').setAttribute('style', '-internal-light-dark(rgb(118, 118, 118), rgb(133, 133, 133));');
        }
        if (document.getElementById('quant').value.trim() === ""){
            document.getElementById('quant').style.borderColor = "red";
        }else{
            document.getElementById('quant').setAttribute('style', '-internal-light-dark(rgb(118, 118, 118), rgb(133, 133, 133));');
        }
    }
}

function reload(){
    reloadButton.disabled = true; addProductButton.disabled = true; saveChangesButton.disabled = true;
    table.innerHTML = '<div class="container"><table class="table table-bordered" id="table"><thead><tr><th>Product</th><th>Quantity</th></tr></thead><tbody></tbody></table></div>';
    onLoad();
}


onLoad();
