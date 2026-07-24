console.log("ORDER DETAILS JS LOADED");

document.addEventListener("DOMContentLoaded", () => {

    startOrderDetails();

});


async function startOrderDetails(){


    const {
        data:{session}
    } = await supabaseClient.auth.getSession();


    if(!session){

        window.location.href = ROUTES.login;

        return;

    }



    loadSidebar("advertiser");



    document.getElementById("header").innerHTML =
    await header("جزئیات سفارش");



    const params =
    new URLSearchParams(window.location.search);



    const orderId =
    params.get("id");



    if(!orderId){

        document.getElementById("orderInfo").innerHTML=`

        <div class="cardBox">

        سفارش پیدا نشد

        </div>

        `;

        return;

    }



    loadOrder(orderId,session.user.id);


}





async function loadOrder(id,userId){

    const box=document.getElementById("orderInfo");


    const {data:order,error}=await supabaseClient

    .from("orders")

    .select("*")

    .eq("id",id)

    .single();

const {data:page}=await supabaseClient

.from("advertiser_pages")

.select("page_name,instagram_id")

.eq("id",order.advertiser_page_id)

.single();

    console.log("ORDER:",order);
    console.log("ERROR:",error);



    if(error || !order){

        box.innerHTML=`

        <div class="cardBox">

        سفارش پیدا نشد

        </div>

        `;

        return;

    }



box.innerHTML=`

<div class="cardBox">

<h2>
جزئیات سفارش
</h2>

<p>
شماره سفارش:
${order.id.substring(0,8)}
</p>

<p>
پیج:
${page?.page_name || "-"}
</p>

<p>
اینستاگرام:
@${page?.instagram_id || "-"}
</p>

<p>
تبلیغ:
${order.service_type || "-"}
</p>

<p>
مبلغ:
${order.price || 0}
تومان
</p>

<p>
آیدی مشتری:
${order.customer_instagram_id || "-"}
</p>

<p>
تاریخ تبلیغ:
${order.publish_date || "-"}
</p>

<p>
ساعت تبلیغ:
${order.publish_time || "-"}
</p>

<p>
توضیحات مشتری:
${order.customer_note || "-"}
</p>

<p>
وضعیت:
${statusText(order.status)}
</p>

<div id="orderActions"></div>

`;

renderActions(order);
}




function renderActions(order){

    const box = document.getElementById("orderActions");


    if(order.status === "waiting_advertiser"){

        box.innerHTML = `

        <button class="btn"
        onclick="acceptOrder('${order.id}')">

        ✅ قبول سفارش

        </button>


        <button class="btn danger"
        onclick="rejectOrder('${order.id}')">

        ❌ رد سفارش

        </button>

        `;

        return;

    }


if(order.status === "advertiser_accepted"){

    box.innerHTML = `

    <div class="cardBox">

    <button
    class="btn"
    onclick="openOrderChat('${order.id}')">

    💬 گفتگو با مشتری

    </button>

    <br><br>

    <h3>

    📤 ارسال نتیجه تبلیغ

    </h3>


    <input
    id="proofLink"
    class="input"
    placeholder="لینک تبلیغ">


    <textarea
    id="proofNote"
    class="input"
    placeholder="توضیحات انجام تبلیغ"></textarea>


    <p>

    📷 لطفاً تصویر یا مدرک انجام تبلیغ را در واتساپ یا تلگرام برای ادمین ارسال کنید.

    </p>


    <button
    class="btn"
    onclick="submitProof('${order.id}')">

    📤 ارسال برای بررسی

    </button>

    </div>

    `;

    return;

}


}



async function acceptOrder(id){


    const {data:{session}} =
    await supabaseClient.auth.getSession();



    if(!session){

        alert("کاربر وارد نشده");

        return;

    }



    // گرفتن اطلاعات سفارش

    const {data:order,error:orderError}=

    await supabaseClient

    .from("orders")

    .select("customer_id,advertiser_page_id")

    .eq("id",id)

    .single();



    if(orderError || !order){

        alert("سفارش پیدا نشد");

        return;

    }




    // گرفتن صاحب پیج

    const {data:page,error:pageError}=

    await supabaseClient

    .from("advertiser_pages")

    .select("user_id")

    .eq("id",order.advertiser_page_id)

    .single();



    if(pageError || !page){

        alert("صاحب پیج پیدا نشد");

        return;

    }




    // تغییر وضعیت سفارش

    const {error:updateError}=

    await supabaseClient

    .from("orders")

    .update({

        status:"advertiser_accepted"

    })

    .eq("id",id);



    if(updateError){

        alert(updateError.message);

        return;

    }





    // ساخت چت سفارش

    const {error:chatError}=

    await supabaseClient

    .from("order_chats")

    .insert({

        order_id:id,

        customer_id:order.customer_id,

        advertiser_id:page.user_id

    });



    if(chatError){

        console.log(chatError);

        alert("سفارش قبول شد ولی چت ساخته نشد");

        return;

    }




    alert("سفارش قبول شد و گفتگو فعال شد");


    location.reload();


}



async function rejectOrder(id){


    const {error}=await supabaseClient

    .from("orders")

    .update({

        status:"rejected"

    })

    .eq("id",id);



    if(error){

        alert(error.message);

        return;

    }


    alert("سفارش رد شد");

    location.href="orders.html";


}



window.acceptOrder=acceptOrder;
window.rejectOrder=rejectOrder;

async function submitProof(id){


    let link =
document.getElementById("proofLink").value.trim();

if(!link.startsWith("http")){

    link = "https://" + link;

}


    const note =
    document.getElementById("proofNote").value.trim();



    if(link === ""){

        alert("لینک تبلیغ را وارد کنید");

        return;

    }



    const {error}=await supabaseClient

    .from("orders")

    .update({

        proof_link: link,

        proof_note: note,

        status:"waiting_admin_check"

    })

    .eq("id",id);



    if(error){

        alert(error.message);

        console.log(error);

        return;

    }



    alert("انجام تبلیغ برای بررسی ادمین ارسال شد");


    location.reload();


}



window.submitProof = submitProof;

function statusText(status){

    switch(status){

        case "pending_payment":
            return "⏳ در انتظار پرداخت";

        case "pending":
            return "⌛ در انتظار تایید ادمین";

        case "waiting_advertiser":
            return "📢 در انتظار قبول صاحب پیج";

        case "advertiser_accepted":
            return "✅ سفارش قبول شده";

        case "waiting_admin_check":
            return "🔍 در انتظار بررسی انجام تبلیغ";

        case "completed":
            return "🎉 انجام شده";

        case "rejected":
            return "❌ رد شده";

        default:
            return "-";

    }

}

async function openOrderChat(orderId){

    const {data:chat,error}=

    await supabaseClient

    .from("order_chats")

    .select("id")

    .eq("order_id",orderId)

    .single();



    if(error || !chat){

        alert("گفتگو هنوز ساخته نشده است");

        return;

    }



    location.href =

    "../chat/order-chat.html?id=" + chat.id;

}



window.openOrderChat = openOrderChat;