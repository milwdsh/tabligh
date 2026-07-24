async function changeOrderStatus(id,status){


const {error}=await supabaseClient

.from("orders")

.update({

status: status

})

.eq("id",id);



if(error){

toast("خطا در تغییر وضعیت سفارش","error");

return;

}



if(status==="accepted"){

toast("سفارش تایید شد");

}



if(status==="rejected"){

toast("سفارش رد شد");

}



setTimeout(()=>{

location.reload();

},1000);



}