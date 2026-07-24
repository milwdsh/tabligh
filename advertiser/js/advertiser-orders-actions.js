function orderButtons(id,status){


if(status !== "pending"){

return "";

}



return `


<div class="orderActions">


<button class="btn"

onclick="updateOrderStatus('${id}','accepted')">

✅ قبول سفارش

</button>



<button class="btn"

onclick="updateOrderStatus('${id}','rejected')">

❌ رد سفارش

</button>



</div>


`;



}