document.addEventListener("DOMContentLoaded",()=>{

    startDashboard();

});





async function startDashboard(){


    const {data:{session}} =
    await supabaseClient.auth.getSession();



    if(!session){

        window.location.href="login.html";

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





    // انتقال نقش ها


    if(profile.role==="admin"){

        window.location.href="admin/admin.html";

        return;

    }



    if(profile.role==="advertiser"){

        window.location.href="advertiser/advertiser.html";

        return;

    }





    if(profile.role!=="customer"){

        alert("نقش کاربر مشخص نیست");

        return;

    }





    loadSidebar("customer");





    document.getElementById("header").innerHTML=

    await header("داشبورد مشتری");





    loadCustomerOrders(profile.id);


    loadTicketNotice(profile.id);



loadOrderChatNotice(profile.id);

}









async function loadCustomerOrders(userId){



    const {data:orders,error}=

    await supabaseClient

    .from("orders")

    .select("*")

    .eq("customer_id",userId);





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





    document.getElementById("doneCount").innerText=

    orders.filter(order=>

        order.status==="completed"

    ).length;





    const box=

    document.getElementById("ordersContainer");





    if(!box){

        return;

    }





    if(orders.length===0){


        box.innerHTML=`

        <div class="cardBox">

        <h3>

        سفارشی ثبت نشده است

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

        سفارش #${order.id.substring(0,8)}

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









async function loadTicketNotice(userId){


    const box = document.getElementById("ticketNotice");


    if(!box) return;



    // نقش کاربر فعلی

    const {data:{session}} =
    await supabaseClient.auth.getSession();



    const {data:profile}=

    await supabaseClient

    .from("profiles")

    .select("role")

    .eq("id",session.user.id)

    .single();



    const myRole = profile.role;




    // گرفتن تیکت های کاربر

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




    let newMessageTicket = null;




    for(const ticket of tickets){



        const {data:lastMessage}=

        await supabaseClient

        .from("ticket_messages")

        .select("sender_role,created_at")

        .eq("ticket_id",ticket.id)

        .order("created_at",{ascending:false})

        .limit(1)

        .single();




        if(!lastMessage) continue;




        // اگر آخرین پیام از شخص دیگری آمده باشد

        if(lastMessage.sender_role !== myRole){


            newMessageTicket = ticket;

            break;


        }


    }






    if(!newMessageTicket){


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

    از تیکت شماره

    <b>
    #${newMessageTicket.ticket_number}
    </b>

    پاسخ جدید دارید.

    </p>



    <button

    class="btn"

    onclick="location.href='tickets/ticket-chat.html?id=${newMessageTicket.id}'">

    مشاهده گفتگو

    </button>


    </div>

    `;



}

async function loadOrderChatNotice(userId){

    const box=document.getElementById("orderChatNotice");

    if(!box) return;

    const {data:chats,error}=

    await supabaseClient

    .from("order_chats")

    .select(`
        id,
        is_closed,
        orders(
            id,
            customer_id
        )
    `);

    if(error){

        console.log(error);

        return;

    }

    let found=null;

    for(const chat of chats){

        if(!chat.orders) continue;

        // فقط چت‌های این مشتری
        if(chat.orders.customer_id !== userId) continue;

        // اگر گفتگو بسته شده باشد، اعلان نده
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

        if(lastMessage.sender_id !== userId){

            found=chat;

            break;

        }

    }

    if(found){

        box.innerHTML = `

        <div class="cardBox">

            <h3>🔔 پیام جدید سفارش</h3>

            <p>

                در گفتگوی سفارش

                <b>#${found.orders.id.substring(0,8)}</b>

                پیام جدید دارید.

            </p>

            <button
                class="btn"
                onclick="location.href='chat/order-chat.html?id=${found.id}'">

                مشاهده گفتگو

            </button>

        </div>

        `;

    }else{

        box.innerHTML = "";

    }

}