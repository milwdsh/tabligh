let orderId = localStorage.getItem("orderId");


if(!orderId){

alert("سفارشی انتخاب نشده");

location.href="../dashboard.html";

}



loadPayment();



async function loadPayment(){


const box=document.getElementById("paymentBox");



const {data,error}=await supabaseClient

.from("orders")

.select("*")

.eq("id",orderId)

.single();



if(error){

console.log(error);

box.innerHTML="خطا در دریافت سفارش";

return;

}



box.innerHTML=`

<div class="cardBox">


<h2>

سفارش شما

</h2>


<p>

مبلغ قابل پرداخت:

<b>

${data.price}

</b>

تومان

</p>



<p>

شماره کارت:

<br>

<b>

5022-2915-0891-0278

</b>

</p>



<input

id="tracking"

placeholder="شماره پیگیری پرداخت">



<input

id="image"

type="file"

accept="image/*">



<button onclick="sendPayment('${data.id}')">

ارسال پرداخت

</button>



</div>

`;



}





async function sendPayment(id){



const tracking = document.getElementById("tracking").value;



if(!tracking){

alert("شماره پیگیری را وارد کنید");

return;

}



const {error}=await supabaseClient

.from("orders")

.update({

payment_status:"waiting",

payment_tracking:tracking,

status:"pending"

})

.eq("id",id);



if(error){

alert(error.message);

return;

}



alert("پرداخت ارسال شد و منتظر تایید مدیریت است");



location.href="../dashboard.html";


}