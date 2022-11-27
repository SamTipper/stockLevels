const button = document.getElementById("add");
const tick = document.getElementById("tick");
button.addEventListener("click", addKey);

function addKey(){
    localStorage.setItem("api-key", document.getElementById("api-key").value);
    tick.style.display = "inline-block";
}
