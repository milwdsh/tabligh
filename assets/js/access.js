async function checkAccess(role){

const {data:{session}} = await supabaseClient.auth.getSession();

if(!session){

window.location.href="login.html";

return false;

}


const {data,error}=await supabaseClient

.from("profiles")

.select("role")

.eq("id",session.user.id)

.single();


if(error){

toast("خطا در بررسی دسترسی","error");

return false;

}


if(data.role !== role){

toast("شما اجازه ورود به این بخش را ندارید","error");


setTimeout(()=>{

window.location.href="dashboard.html";

},1500);


return false;

}


return true;

}
