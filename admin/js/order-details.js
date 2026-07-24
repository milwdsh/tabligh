document.addEventListener("DOMContentLoaded",()=>{

    startOrderDetails();

});



async function startOrderDetails(){

    const {data:{session}} =
    await supabaseClient.auth.getSession();


    if(!session){

        window.location.href = ROUTES.login;

        return;

    }



    const {data:profile,error} =

    await supabaseClient

    .from("profiles")

    .select("role")

    .eq("id",session.user.id)

    .single();



    if(error || !profile || profile.role !== "admin"){

        alert("دسترسی ندارید");

        window.location.href = ROUTES.dashboard;

        return;

    }



    loadSidebar("admin");



    document.getElementById("header").innerHTML =

    await header("جزئیات سفارش");



    loadOrderDetails();

}







async function loadOrderDetails(){


    const params =
    new URLSearchParams(window.location.search);


    const orderId = params.get("id");



    if(!orderId){

        alert("شناسه سفارش پیدا نشد");

        return;

    }



    const {data:order,error}=

    await supabaseClient

    .from("orders")

    .select(`

        *,

        advertiser_pages(

            page_name,

            instagram_id,

            followers,

            story_views,

            reel_views

        )

    `)

    .eq("id",orderId)

    .single();




    if(error || !order){

        alert("خطا در دریافت سفارش");

        console.log(error);

        return;

    }






    const {data:customer}=

    await supabaseClient

    .from("profiles")

    .select("name,email")

    .eq("id",order.customer_id)

    .single();





    document.getElementById("orderDetails").innerHTML = `


    <div class="cardBox">


    <h2>

    📦 سفارش #${order.id.substring(0,8)}

    </h2>


    <hr>



    <h3>

    👤 مشتری

    </h3>


    <p>

    نام:

    ${customer?.name || "-"}

    </p>


    <p>

    ایمیل:

    ${customer?.email || "-"}

    </p>


    <p>

    📞 شماره تماس:

    ${order.customer_phone || "-"}

    </p>


    <p>

    📷 پیج مشتری:

    ${order.customer_instagram_id || "-"}

    </p>


    <hr>



    <h3>

    📌 پیج تبلیغاتی

    </h3>


    <p>

    نام پیج:

    ${order.advertiser_pages?.page_name || "-"}

    </p>


    <p>

    اینستاگرام:

    ${order.advertiser_pages?.instagram_id || "-"}

    </p>


    <p>

    دنبال کننده:

    ${order.advertiser_pages?.followers || 0}

    </p>


    <hr>


    <h3>

    📢 اطلاعات تبلیغ

    </h3>


    <p>

    نوع تبلیغ:

    ${order.service_type || "-"}

    </p>


    <p>

    💰 مبلغ:

    ${formatPrice(order.price || 0)}

    تومان

    </p>


    <p>

    📅 تاریخ تبلیغ:

    ${order.publish_date || "-"}

    </p>


    <p>

    ⏰ ساعت:

    ${order.publish_time || "-"}

    </p>


    <p>

    📝 توضیحات:

    ${order.description || "-"}

    </p>



    <hr>


    <h3>

    وضعیت

    </h3>


    <p>

    📋 سفارش:

    ${orderStatusFa(order.status)}

    </p>


    <p>

    💳 پرداخت:

    ${paymentStatusFa(order.payment_status)}

    </p>


    <div id="orderActions"></div>


    <br>


    <a class="btn"

    href="admin-orders.html">

    ⬅ بازگشت

    </a>


    </div>


    `;



    renderOrderActions(order);


}

async function renderOrderActions(order){

    const box = document.getElementById("orderActions");
    if(!box) return;

    const {data:chat} = await supabaseClient
    .from("order_chats")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();


    let html = "";

    switch(order.status){

        case "pending":

            html += `
            <button class="btn"
            onclick="changeStatus('${order.id}','waiting_advertiser')">
            📤 ارسال برای صاحب پیج
            </button>

            <button class="btn danger"
            onclick="changeStatus('${order.id}','rejected')">
            ❌ رد سفارش
            </button>
            `;
        break;

        case "waiting_advertiser":

            html += `
            <div class="cardBox">
            ⏳ سفارش برای صاحب پیج ارسال شده است.
            </div>
            `;
        break;

        case "advertiser_accepted":

            html += `
            <div class="cardBox">
            ✅ صاحب پیج سفارش را قبول کرده است.
            </div>
            `;

            if(chat){
                html += `
                <br>
                <a class="btn"
                href="../chat/order-chat.html?id=${chat.id}">
                💬 گفتگو با مشتری و صاحب پیج
                </a>
                `;
            }
        break;

        case "waiting_admin_check":

            if(chat){
                html += `
                <a class="btn"
                href="../chat/order-chat.html?id=${chat.id}">
                💬 گفتگو
                </a>
                <br><br>
                `;
            }

            html += `
            <a class="btn"
            href="admin-review-orders.html">
            🔎 بررسی تبلیغ انجام شده
            </a>
            `;
        break;

        case "completed":

            if(chat){
                html += `
                <a class="btn"
                href="../chat/order-chat.html?id=${chat.id}">
                💬 مشاهده گفتگو
                </a>
                <br><br>
                `;
            }

            html += `
            <div class="cardBox">
            ✅ این سفارش تکمیل شده است.
            </div>
            `;
        break;

        case "rejected":

            html += `
            <div class="cardBox">
            ❌ این سفارش رد شده است.
            </div>
            `;
        break;
    }

    box.innerHTML = html;
}







async function changeStatus(id,status){

    if(!confirm("آیا تغییر وضعیت انجام شود؟"))
        return;

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

    loadOrderDetails();

}

function orderStatusFa(status){


    switch(status){


        case "pending_payment":

            return "⏳ در انتظار پرداخت";



        case "pending":

            return "⌛ در انتظار تایید ادمین";



        case "waiting_advertiser":

            return "📤 ارسال شده برای صاحب پیج";



        case "advertiser_accepted":

            return "✅ صاحب پیج قبول کرده";



        case "waiting_admin_check":

            return "🔎 در انتظار بررسی تبلیغ";



        case "completed":

            return "🎉 تکمیل شده";



        case "rejected":

            return "❌ رد شده";



        default:

            return status || "-";


    }


}








function paymentStatusFa(status){


    switch(status){


        case "unpaid":

            return "❌ پرداخت نشده";



        case "waiting":

            return "⏳ در انتظار تایید پرداخت";



        case "paid":

            return "✅ پرداخت شده";



        default:

            return status || "-";


    }


}






window.changeStatus = changeStatus;