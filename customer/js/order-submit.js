const selectedPage = localStorage.getItem("selectedPage");


if(!selectedPage){

toast("ابتدا یک پیج انتخاب کنید","error");

setTimeout(()=>{

window.location.href="select-page.html";

},1500);

}



document.getElementById("submitOrder").onclick = submitOrder;



async function submitOrder(){


const {data:{session}} = await supabaseClient.auth.getSession();



if(!session){

toast("ابتدا وارد حساب شوید","error");

return;

}



const service = document.getElementById("serviceType").value;

const date = document.getElementById("publishDate").value;

const description = document.getElementById("description").value;



let price = 0;



const {data:page}=await supabaseClient

.from("advertiser_pages")

.select("*")

.eq("id",selectedPage)

.single();



if(service==="story"){

price=page.story_price;

}


if(service==="post"){

price=page.post_price;

}


if(service==="reel"){

price=page.reel_price;

}



const {error}=await supabaseClient

.from("orders")

.insert({

customer_id:session.user.id,

advertiser_page_id:selectedPage,

service_type:service,

description:description,

price:price,

publish_date:date,

status:"pending"

});



if(error){

console.log(error);

toast("ثبت سفارش انجام نشد","error");

return;

}



toast("سفارش با موفقیت ثبت شد");



localStorage.removeItem("selectedPage");



setTimeout(()=>{

window.location.href="dashboard.html";

},1500);


}