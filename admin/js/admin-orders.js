document.addEventListener("DOMContentLoaded",()=>{

startAdminOrders();

});


async function startAdminOrders(){


const {data:{session}} =
await supabaseClient.auth.getSession();


if(!session){

window.location.href = ROUTES.login;

return;

}



const {data:profile,error}=await supabaseClient

.from("profiles")

.select("role")

.eq("id",session.user.id)

.single();



if(error || !profile || profile.role!=="admin"){

alert("دسترسی ندارید");

window.location.href=ROUTES.dashboard;

return;

}



loadSidebar("admin");


document.getElementById("header").innerHTML =
await header("مدیریت سفارش‌ها");


loadOrders();


}





async function loadOrders(){


const box=document.getElementById("ordersContainer");



const {data,error}=await supabaseClient

.from("orders")

.select(`

*,

advertiser_pages(

page_name,

instagram_id

)

`)

.neq("status","rejected")

.order("created_at",{ascending:false});




if(error){

box.innerHTML="خطا در دریافت سفارش‌ها";

console.log(error);

return;

}



box.innerHTML="";



if(!data || data.length===0){

box.innerHTML=`

<div class="cardBox">

<h2>سفارشی وجود ندارد</h2>

</div>

`;

return;

}




data.forEach(order=>{


box.innerHTML += `


<div class="cardBox">


<h2>

📦 سفارش #${order.id.substring(0,8)}

</h2>



<p>

📌 پیج:

${order.advertiser_pages?.page_name || "-"}

</p>



<p>

📢 تبلیغ:

${order.service_type || "-"}

</p>



<p>

💰 مبلغ:

${formatPrice(order.price || 0)}

تومان

</p>



<p>

📋 وضعیت:

${statusFa(order.status)}

</p>




<div class="actions">

<a class="btn"
href="order-details.html?id=${order.id}">

🔍 باز کردن سفارش

</a>

</div>



</div>


`;



});


}







async function changeStatus(id,status){



if(!confirm("آیا تغییر وضعیت انجام شود؟")){

return;

}




const {error}=await supabaseClient

.from("orders")

.update({

status:status

})

.eq("id",id);





if(error){

alert(error.message);

return;

}



alert("وضعیت تغییر کرد");


loadOrders();



}






function statusFa(status){


switch(status){


case "pending_payment":

return "⏳ در انتظار پرداخت";


case "pending":

return "⌛ در انتظار تایید";


case "waiting_advertiser":
return "📤 منتظر قبول صاحب پیج";


case "rejected":

return "❌ رد شده";


case "completed":

return "🎉 انجام شده";


default:

return status || "-";


}

}



window.changeStatus=changeStatus;