async function getAdvertiserOrders(){


const {data:{session}} =
await supabaseClient.auth.getSession();



if(!session){

toast("ابتدا وارد شوید","error");

return [];

}




const {data:pages,error:pageError}=

await supabaseClient

.from("advertiser_pages")

.select("id")

.eq("user_id",session.user.id);





if(pageError || !pages || pages.length===0){


return [];

}





const pageIds = pages.map(page=>page.id);





const {data,error}=

await supabaseClient

.from("orders")

.select("*")

.in("advertiser_page_id",pageIds)

.order("created_at",{ascending:false});





if(error){

toast("خطا در دریافت سفارش‌ها","error");

return [];

}




return data || [];



}