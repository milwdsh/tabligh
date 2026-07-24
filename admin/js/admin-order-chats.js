document.addEventListener("DOMContentLoaded",()=>{

    startAdminOrderChats();

});

async function startAdminOrderChats(){

    const {data:{session}} =
    await supabaseClient.auth.getSession();

    if(!session){

        location.href = ROUTES.login;
        return;

    }

    const {data:profile,error} =
    await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id",session.user.id)
    .single();

    if(error || profile.role!=="admin"){

        alert("دسترسی ندارید");
        location.href = ROUTES.dashboard;
        return;

    }

    loadSidebar("admin");

    document.getElementById("header").innerHTML =
    await header("گفتگوهای فعال");

    loadActiveChats();

}

async function loadActiveChats(){

    const box=document.getElementById("chatContainer");

    const {data:chats,error}=await supabaseClient

    .from("order_chats")

    .select(`
        id,
        created_at,
        orders(
            id,
            status,
            service_type,
            price,
            customer_instagram_id,
            advertiser_pages(
                page_name
            )
        )
    `)

    .eq("is_closed",false)

    .order("created_at",{ascending:false});

    if(error){

        console.log(error);
        box.innerHTML="خطا در دریافت گفتگوها";
        return;

    }

    if(!chats || chats.length===0){

        box.innerHTML=`

        <div class="cardBox">

            <h3>هیچ گفتگوی بازی وجود ندارد.</h3>

        </div>

        `;

        return;

    }

    box.innerHTML="";

    chats.forEach(chat=>{

        const order=chat.orders;

        box.innerHTML+=`

        <div class="cardBox">

            <h2>
                💬 سفارش #${order.id.substring(0,8)}
            </h2>

            <p>
                📢 پیج:
                ${order.advertiser_pages?.page_name || "-"}
            </p>

            <p>
                👤 مشتری:
                ${order.customer_instagram_id || "-"}
            </p>

            <p>
                📦 نوع تبلیغ:
                ${order.service_type || "-"}
            </p>

            <p>
                💰 مبلغ:
                ${formatPrice(order.price || 0)} تومان
            </p>

            <p>
                📋 وضعیت:
                ${orderStatusFa(order.status)}
            </p>

            <br>

            <a
            class="btn"
            href="../chat/order-chat.html?id=${chat.id}">

            💬 ورود به گفتگو

            </a>

        </div>

        `;

    });

}

function orderStatusFa(status){

    switch(status){

        case "pending_payment":
            return "در انتظار پرداخت";

        case "pending":
            return "در انتظار تایید";

        case "waiting_advertiser":
            return "ارسال شده برای صاحب پیج";

        case "advertiser_accepted":
            return "صاحب پیج قبول کرده";

        case "waiting_admin_check":
            return "در انتظار بررسی تبلیغ";

        case "completed":
            return "تکمیل شده";

        case "rejected":
            return "رد شده";

        default:
            return status;

    }

}