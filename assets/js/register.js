const registerBtn=document.getElementById("registerBtn");

registerBtn.addEventListener("click",registerUser);

async function registerUser(){

const name=document.getElementById("name").value.trim();

const username =
document.getElementById("username").value
.trim()
.toLowerCase();

const email=document.getElementById("email").value.trim();

const password=document.getElementById("password").value.trim();

const role=document.getElementById("role").value;

if(name===""){

alert("نام را وارد کنید");

return;

}

if(username===""){

alert("آیدی کاربری را وارد کنید");

return;

}


if(!/^[a-z0-9_]{4,20}$/.test(username)){


alert("آیدی باید بین ۴ تا ۲۰ کاراکتر و فقط شامل حروف انگلیسی، عدد و _ باشد.");

return;


}

const {data:existUser} =

await supabaseClient

.from("profiles")

.select("id")

.eq("username",username)

.single();


if(existUser){

    alert("این آیدی قبلاً استفاده شده است.");

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

username:username,

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