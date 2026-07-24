const loginBtn=document.getElementById("loginBtn");

loginBtn.addEventListener("click",loginUser);

async function loginUser(){

const email=document.getElementById("email").value.trim();

const password=document.getElementById("password").value.trim();

if(email===""){

alert("ایمیل را وارد کنید");

return;

}

if(password===""){

alert("رمز عبور را وارد کنید");

return;

}

loginBtn.disabled=true;

loginBtn.innerText="در حال ورود...";

const {data,error}=await supabaseClient.auth.signInWithPassword({

email,

password

});

loginBtn.disabled=false;

loginBtn.innerText="ورود";

if(error){

alert("ایمیل یا رمز عبور اشتباه است.");

return;

}

const {data:profile}=await supabaseClient

.from("profiles")

.select("*")

.eq("id",data.user.id)

.single();

if(profile.role==="customer"){

window.location.href="dashboard.html";

return;

}

if(profile.role==="advertiser"){

window.location.href="advertiser/advertiser.html";

return;

}

if(profile.role==="admin"){

window.location.href="admin/admin.html";

return;

}

}