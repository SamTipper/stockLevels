const table = document.getElementById("table");
const saveButton = document.getElementById("save");
const newButton = document.getElementById("new");
const doneButton = document.getElementById("done");
const version = document.getElementById("version");
saveButton.addEventListener("click", updateList);
newButton.addEventListener("click", newList);
doneButton.addEventListener("click", mergeBoughtItems);
let products = {};
let APIKEY;

if (localStorage.getItem("api-key") !== null){
    APIKEY = localStorage.getItem("api-key");
}else{
    APIKEY = localStorage.setItem("api-key", "temp");
}

function connect(){
    const Http = new XMLHttpRequest();
    Http.open("GET", "https://api.samtipper.repl.co/auth-user");
        Http.setRequestHeader("Content-Type", "application/json");
        Http.setRequestHeader("Api-Key", APIKEY);
        Http.send();
        Http.onreadystatechange = function(){
            if (this.readyState === 4 && this.status === 200){
                if (APIKEY !== this.response){
                    APIKEY = this.response
                    localStorage.setItem("api-key", this.response);
                }
                productCount();
                getList();
                return 0;
            } else if (this.readyState === 4 && this.status === 401){
                document.getElementById('amount').innerHTML = "Access Denied";
            }
        }
}

function productCount(){
    const HTTP = new XMLHttpRequest();
        HTTP.open("GET", "https://api.samtipper.repl.co/get");
        HTTP.setRequestHeader("Content-Type", "application/json");
        HTTP.setRequestHeader("Api-Key", APIKEY);
        HTTP.send();
        HTTP.onreadystatechange = function(){
            if (this.readyState === 4 && this.status === 200){
                document.getElementById('amount').innerHTML = `${HTTP.response} Unique Products!`;
            }
        }
    }


    
function populateTable(items){
    let itemsObj = JSON.parse(items);
    let editable = true;
    if (itemsObj.version === true){editable = false;}
    for (const [key, value] of Object.entries(itemsObj)){
        if (key !== "version"){
            const newRow = table.insertRow(table.length);
            const cell0 = newRow.insertCell(newRow.length);
            const cell1 = newRow.insertCell(newRow.length);
            cell0.innerHTML = key;
            cell1.setAttribute('contenteditable', editable);
            cell1.innerHTML = value;
        }
    }
    if (Object.keys(itemsObj).length > 1 && itemsObj['version'] === false){
        saveButton.disabled = false; 
    }
    if (itemsObj['version'] === true){
        version.innerHTML = "Saved Shopping List";
        doneButton.disabled = false; 
    }else{
        version.innerHTML = "Unsaved Shopping List";
    }
    newButton.disabled = false;
    
}

function getList(){
    let found = false;
    const Http = new XMLHttpRequest();
        Http.open("GET", "https://api.samtipper.repl.co/shopping-list");
        Http.setRequestHeader("Content-Type", "application/json");
        Http.setRequestHeader("Api-Key", APIKEY);
        Http.send();
        Http.onreadystatechange = function(){
            if (this.readyState === 4 && this.status === 200 && found === false && Http.response !== ""){
                found = true;
                populateTable(Http.response);
            }
        }
}

function updateList(){
    products = {};
    saveButton.disabled = true;
    for (let i = 0, row; row = table.rows[i]; i++) {
        let items = [];
        for (let j = 0, col; col = row.cells[j]; j++) {
            row.cells[j].setAttribute('contenteditable', false);
            items.push(table.rows[i].cells[j].innerHTML);
        }
        if (items[0] !== "Product"){
            if (items[0] !== "Quantity"){
            products[items[0]] = items[1];
            }
        }
    }
    const Http = new XMLHttpRequest();
        Http.open("POST", "https://api.samtipper.repl.co/update-list");
        Http.setRequestHeader("Content-Type", "application/json");
        Http.setRequestHeader("Api-Key", APIKEY);
        Http.send(JSON.stringify(products));
        Http.onreadystatechange = function(){
            if (this.readyState === 4 && this.status === 200){
                doneButton.disabled = false;
                version.innerHTML = "Saved Shopping List";
            }
        }
}

function newList(){
    newButton.disabled = true;
    const Http = new XMLHttpRequest();
        Http.open("GET", "https://api.samtipper.repl.co/new-list");
        Http.setRequestHeader("Content-Type", "application/json");
        Http.setRequestHeader("Api-Key", APIKEY);
        Http.send();
        Http.onreadystatechange = function(){
            if (this.readyState === 4 && this.status === 200){
                newButton.disabled = false;
            }
        }
        
    function checkIfNew(){
        const Http = new XMLHttpRequest();
            Http.open("GET", "https://api.samtipper.repl.co/shopping-list");
            Http.setRequestHeader("Content-Type", "application/json");
            Http.setRequestHeader("Api-Key", APIKEY);
            Http.send();
            Http.onreadystatechange = function(){
                if (this.readyState === 4 && this.status === 200){
                    const items = JSON.parse(Http.response)
                    if (items.version === true){
                        checkIfNew();
                    }
                }
            }
    }

    checkIfNew();
    table.innerHTML = '<table class="table table-bordered" id="table"><thead><tr><th>Product</th><th>Quantity</th></tr></thead><tbody></tbody></table>';
    getList();
    doneButton.disabled = true;
}

function mergeBoughtItems(){
    newButton.disabled = true; doneButton.disabled = true;
    products = {};
    
    for (let i = 0, row; row = table.rows[i]; i++) {
        let items = [];
        for (let j = 0, col; col = row.cells[j]; j++) {
            items.push(table.rows[i].cells[j].innerHTML);
        }
        if (items[0] !== "Product"){
            if (items[0] !== "Quantity"){
            products[items[0]] = items[1];
            }
        }
    }
    const Http = new XMLHttpRequest();
        Http.open("GET", "https://api.samtipper.repl.co/shopping-done");
        Http.setRequestHeader("Content-Type", "application/json");
        Http.setRequestHeader("Api-Key", APIKEY);
        Http.send();
    newButton.disabled = false; doneButton.disabled = false;
    newList();
}


connect();