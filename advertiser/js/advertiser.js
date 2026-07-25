document.addEventListener("DOMContentLoaded",()=>{

    startAdvertiserDashboard();

});





async function startAdvertiserDashboard(){



    const {data:{session}} =

    await supabaseClient.auth.getSession();





    if(!session){

        window.location.href="../login.html";

        return;

    }






    const {data:profile,error}=

    await supabaseClient

    .from("profiles")

    .select("*")

    .eq("id",session.user.id)

    .single();





    if(error || !profile){

        alert("خطا در دریافت اطلاعات کاربر");

        return;

    }






    if(profile.role!=="advertiser"){

        alert("دسترسی غیرمجاز");

        return;

    }





    loadSidebar("advertiser");





    document.getElementById("header").innerHTML=

    await header("داشبورد صاحب پیج");





    loadAdvertiserOrders(profile.id);



    loadWallet(profile.id);



    loadAdvertiserTicket(profile.id);

loadOrderChatNotice(profile.id);

}









async function loadAdvertiserOrders(userId){



    const {data:pages,error:pageError}=

    await supabaseClient

    .from("advertiser_pages")

    .select("id")

    .eq("user_id",userId);





    if(pageError){

        console.log(pageError);

        return;

    }





    if(!pages || pages.length===0){

        return;

    }





    const pageIds =

    pages.map(page=>page.id);






    const {data:orders,error}=

    await supabaseClient

    .from("orders")

    .select("*")

    .in("advertiser_page_id",pageIds);





    if(error){

        console.log(error);

        return;

    }





    document.getElementById("ordersCount").innerText=

    orders.length;





    document.getElementById("pendingCount").innerText=

    orders.filter(order=>

        order.status==="pending"

    ).length;






    const box=

    document.getElementById("ordersContainer");





    if(!box) return;





    if(orders.length===0){


        box.innerHTML=`

        <div class="cardBox">

        <h3>

        سفارشی برای پیج شما وجود ندارد

        </h3>

        </div>

        `;


        return;

    }





    box.innerHTML="";





    orders.forEach(order=>{


        box.innerHTML+=`

        <div class="cardBox">


        <h3>

        سفارش تبلیغ

        </h3>



        <p>

        نوع تبلیغ:

        ${order.service_type || "-"}

        </p>



        <p>

        مبلغ:

        ${formatPrice(order.price || 0)}

        تومان

        </p>



        <p>

        وضعیت:

        ${orderStatusText(order.status)}

        </p>



        </div>


        `;


    });



}









async function loadWallet(userId){



    const {data:wallet,error}=

    await supabaseClient

    .from("wallets")

    .select("balance")

    .eq("user_id",userId)

    .single();





    if(error){

        console.log(error);

        return;

    }





    document.getElementById("walletAmount").innerText=

    formatPrice(wallet.balance || 0);




}









async function loadAdvertiserTicket(userId){



    const box=

    document.getElementById("ticketNotice");





    if(!box) return;





    const {data:tickets,error}=

    await supabaseClient

    .from("tickets")

    .select("id,ticket_number")

    .eq("user_id",userId)

    .eq("status","open");



    if(error){

        console.log(error);

        return;

    }





    let found=null;





    for(const ticket of tickets){


        const {data:lastMessage}=

        await supabaseClient

        .from("ticket_messages")

        .select("sender_role")

        .eq("ticket_id",ticket.id)

        .order("created_at",{ascending:false})

        .limit(1)

        .single();





        if(lastMessage && lastMessage.sender_role!=="advertiser"){

            found=ticket;

            break;

        }


    }






    if(!found){


        box.innerHTML=`

        <div class="cardBox">

        <h3>

        🔔 اعلان‌ها

        </h3>

        <p>

        پیام جدیدی ندارید.

        </p>

        </div>

        `;


        return;


    }





    box.innerHTML=`

    <div class="cardBox">


    <h3>

    🔔 پیام جدید

    </h3>



    <p>

    در تیکت

    <b>
    #${found.ticket_number}
    </b>

    پیام جدید دارید.

    </p>



    <button

    class="btn"

    onclick="location.href='../tickets/ticket-chat.html?id=${found.id}'">

    مشاهده گفتگو

    </button>



    </div>

    `;


}

async function loadOrderChatNotice(userId){

    const box=document.getElementById("orderChatNotice");

    if(!box) return;

    // پیج‌های صاحب پیج
    const {data:pages,error:pagesError}=

    await supabaseClient

    .from("advertiser_pages")

    .select("id")

    .eq("user_id",userId);

    if(pagesError || !pages){

        console.log(pagesError);

        return;

    }

    const pageIds=pages.map(p=>p.id);

    if(pageIds.length===0){

        box.innerHTML="";
        return;

    }

    // سفارش‌های مربوط به این پیج‌ها
    const {data:orders}=

    await supabaseClient

    .from("orders")

    .select("id,advertiser_page_id")

    .in("advertiser_page_id",pageIds);

    let found=null;

    for(const order of orders){

        const {data:chat}=

        await supabaseClient

        .from("order_chats")

        .select("id,is_closed")

        .eq("order_id",order.id)

        .maybeSingle();

        if(!chat) continue;

        if(chat.is_closed) continue;

        const {data:lastMessage}=

        await supabaseClient

        .from("order_messages")

        .select("sender_id")

        .eq("chat_id",chat.id)

        .order("created_at",{ascending:false})

        .limit(1)

        .single();

        if(!lastMessage) continue;

        if(lastMessage.sender_id!==userId){

            found={

                orderId:order.id,

                chatId:chat.id

            };

            break;

        }

    }

    if(!found){

        box.innerHTML=`

        <div class="cardBox">

            <h3>💬 گفتگوی سفارش</h3>

            <p>پیام جدیدی ندارید.</p>

        </div>

        `;

        return;

    }

    box.innerHTML=`

    <div class="cardBox">

        <h3>💬 پیام جدید سفارش</h3>

        <p>

        در سفارش

        <b>

        #${found.orderId.substring(0,8)}

        </b>

        پیام جدید دارید.

        </p>

        <button

        class="btn"

        onclick="location.href='../chat/order-chat.html?id=${found.chatId}'">

        مشاهده گفتگو

        </button>

    </div>

    `;

}
