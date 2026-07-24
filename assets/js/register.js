const registerBtn=document.getElementById("registerBtn");

registerBtn.addEventListener("click",registerUser);

async function registerUser(){

const name=document.getElementById("name").value.trim();

const email=document.getElementById("email").value.trim();

const password=document.getElementById("password").value.trim();

const role=document.getElementById("role").value;

if(name===""){

alert("نام را وارد کنید");

return;

}

if(email===""){

alert("ایمیل را وارد کنید");

return;

}

if(password.length<6){

alert("رمز عبور باید حداقل ۶ کاراکتر باشد.");

return;

}

registerBtn.disabled=true;

registerBtn.innerText="در حال ثبت نام...";

const {data,error}=await supabaseClient.auth.signUp({

email,

password

});

if(error){

registerBtn.disabled=false;

registerBtn.innerText="ثبت نام";

alert(error.message);

return;

}

const user=data.user;

const {error:profileError}=await supabaseClient

.from("profiles")

.insert({

id:user.id,

name:name,

email:user.email,

role:role

});

registerBtn.disabled=false;

registerBtn.innerText="ثبت نام";

if(profileError){

alert(profileError.message);

return;

}

alert("ثبت نام با موفقیت انجام شد.");

window.location.href="login.html";

}