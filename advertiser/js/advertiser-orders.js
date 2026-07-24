document.addEventListener("DOMContentLoaded",()=>{

startAdvertiserOrders();

});




async function startAdvertiserOrders(){


const {data:{session}} =
await supabaseClient.auth.getSession();



if(!session){

window.location.href = ROUTES.login;

return;

}



const {data:profile,error}=

await supabaseClient

.from("profiles")

.select("role")

.eq("id",session.user.id)

.single();





if(error || !profile || profile.role !== "advertiser"){

alert("دسترسی ندارید");

window.location.href = ROUTES.dashboard;

return;

}





loadSidebar("advertiser");



document.getElementById("header").innerHTML =

  await header("سفارش‌های تبلیغ");



loadOrders();


}









async function loadOrders(){



const {data:{session}} =
await supabaseClient.auth.getSession();




const box =
document.getElementById("ordersContainer");





const {data:pages,error:pageError}=

await supabaseClient

.from("advertiser_pages")

.select("id")

.eq("user_id",session.user.id);






if(pageError || !pages || pages.length===0){


box.innerHTML=`

<div class="cardBox">

پیجی ثبت نشده است

</div>

`;

return;

}






const pageIds =
pages.map(p=>p.id);







const {data,error}=

await supabaseClient

.from("orders")

.select(`

*,

advertiser_pages(

page_name,

instagram_id

)

`)

.in("advertiser_page_id",pageIds)

.eq("status","accepted")

.order("created_at",{ascending:false});







if(error){

console.log(error);

box.innerHTML="خطا در دریافت سفارش‌ها";

return;

}





box.innerHTML="";






if(!data || data.length===0){


box.innerHTML=`

<div class="cardBox">

<h2>

سفارش جدیدی وجود ندارد

</h2>

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

📅 تاریخ:

${order.publish_date || "-"}

</p>



<p>

⏰ ساعت:

${order.publish_time || "-"}

</p>





<button class="btn"

onclick="completeOrder('${order.id}')">

✅ انجام شد

</button>



</div>



`;



});



}









async function completeOrder(id){



if(!confirm("آیا تبلیغ انجام شده است؟")){

return;

}






const {data:order,error}=

await supabaseClient

.from("orders")

.select("*")

.eq("id",id)

.single();





if(error){

alert(error.message);

return;

}





if(order.status==="completed"){

alert("این سفارش قبلا انجام شده");

return;

}






const price =
Number(order.price || 0);



const advertiserAmount =
price * 0.85;



const adminAmount =
price * 0.15;







const {data:page,error:pageError}=

await supabaseClient

.from("advertiser_pages")

.select("user_id")

.eq("id",order.advertiser_page_id)

.single();





if(pageError){

alert(pageError.message);

return;

}






/* --------------------
   کیف پول صاحب پیج
-------------------- */



const {data:advertiserWallet}=

await supabaseClient

.from("wallets")

.select("*")

.eq("user_id",page.user_id)

.maybeSingle();






if(advertiserWallet){


await supabaseClient

.from("wallets")

.update({

balance:

Number(advertiserWallet.balance || 0)

+

advertiserAmount

})

.eq("id",advertiserWallet.id);



}else{


await supabaseClient

.from("wallets")

.insert({

user_id:page.user_id,

balance:advertiserAmount

});


}








// تراکنش صاحب پیج

await supabaseClient

.from("transactions")

.insert({

user_id:page.user_id,

amount:advertiserAmount,

type:"advertiser_income",

description:"درآمد تبلیغ",

order_id:id

});









/* --------------------
   کیف پول ادمین
-------------------- */



const {data:adminProfile,error:adminError}=

await supabaseClient

.from("profiles")

.select("id")

.eq("role","admin")

.single();





if(adminError){

alert("ادمین پیدا نشد");

return;

}







const {data:adminWallet}=

await supabaseClient

.from("wallets")

.select("*")

.eq("user_id",adminProfile.id)

.maybeSingle();







if(adminWallet){


await supabaseClient

.from("wallets")

.update({

balance:

Number(adminWallet.balance || 0)

+

adminAmount

})

.eq("id",adminWallet.id);



}else{


await supabaseClient

.from("wallets")

.insert({

user_id:adminProfile.id,

balance:adminAmount

});


}







// تراکنش ادمین

await supabaseClient

.from("transactions")

.insert({

user_id:adminProfile.id,

amount:adminAmount,

type:"admin_income",

description:"کارمزد تبلیغ",

order_id:id

});








// تغییر وضعیت سفارش


const {error:updateError}=

await supabaseClient

.from("orders")

.update({

status:"completed"

})

.eq("id",id);






if(updateError){

alert(updateError.message);

return;

}





alert("تبلیغ ثبت شد و درآمد تقسیم شد");



loadOrders();



}







window.completeOrder = completeOrder;