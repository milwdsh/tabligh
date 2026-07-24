loadSidebar("customer");


document.getElementById("header").innerHTML =
   await header("سفارش‌های من");


loadCustomerOrders();





async function loadCustomerOrders(){



const {data:{session}} =
await supabaseClient.auth.getSession();



if(!session){

toast("ابتدا وارد شوید","error");

return;

}




const {data,error}=await supabaseClient

.from("orders")

.select("*")

.eq("customer_id",session.user.id)

.order("created_at",{ascending:false});





if(error){

toast("خطا در دریافت سفارش‌ها","error");

return;

}




const box =
document.getElementById("ordersContainer");



box.innerHTML="";





if(data.length===0){


box.innerHTML=`

<div class="cardBox">

<h2>
هنوز سفارشی ثبت نکرده‌اید
</h2>

</div>

`;

return;

}





data.forEach(order=>{


box.innerHTML+=`

<div class="cardBox">


<h2>

${order.service_type || "-"}

</h2>



<p>

💰 مبلغ:

${formatPrice(order.price || 0)}

تومان

</p>



<p>

📅 تاریخ ثبت سفارش:

${toJalali(order.created_at)}

</p>



<p>

📋 وضعیت:

${orderStatusText(order.status)}

</p>


${
order.status==="advertiser_accepted"

?

`

<button

class="btn"

onclick="openOrderChat('${order.id}')">

💬 گفتگو با صاحب پیج

</button>

`

:

""

}


</div>

`;



});



}






function toJalali(date){


if(!date){

return "-";

}


return new Date(date).toLocaleDateString("fa-IR");

}

async function openOrderChat(orderId){


const {data:chat,error}=

await supabaseClient

.from("order_chats")

.select("id")

.eq("order_id",orderId)

.single();



if(error || !chat){

toast("گفتگو فعال نشده است","error");

return;

}



location.href=

"../chat/order-chat.html?id="+chat.id;


}



window.openOrderChat=openOrderChat;