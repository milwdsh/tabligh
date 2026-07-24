function renderOrderCard(order){


return `


<div class="cardBox">


<h2>

${order.service_type || "تبلیغ"}

</h2>




<p>

توضیحات:

${order.description || "-"}

</p>




<p>

مبلغ:

${formatPrice(order.price || 0)}

تومان

</p>




<p>

وضعیت:


${orderStatusText(order.status)}

</p




<p>

پرداخت:

${order.payment_status || "unpaid"}

</p>




${orderButtons(order.id,order.status)}




</div>


`;



}