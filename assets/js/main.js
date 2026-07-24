document.addEventListener("DOMContentLoaded",()=>{

const login=document.querySelector(".login");
const register=document.querySelector(".register");
const order=document.querySelector(".primary");
const pages=document.querySelector(".secondary");

if(login){

login.onclick=()=>{

window.location.href="login.html";

};

}

if(register){

register.onclick=()=>{

window.location.href="register.html";

};

}

if(order){

order.onclick=()=>{

window.location.href="order.html";

};

}

if(pages){

pages.onclick=()=>{

window.location.href="advertisers.html";

};

}

const cards=document.querySelectorAll(".card");

cards.forEach(card=>{

card.onclick=()=>{

const category=card.innerText;

alert("دسته انتخاب شد : "+category);

};

});

});