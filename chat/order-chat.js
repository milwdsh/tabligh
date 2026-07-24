console.log("ORDER CHAT LOADED");

document.addEventListener("DOMContentLoaded",()=>{

    startOrderChat();

});



let chatId=null;
let currentRole="";
let currentUserId="";
let chatClosed=false;
async function startOrderChat(){

    const {data:{session}}=

    await supabaseClient.auth.getSession();



    if(!session){

        location.href="../login.html";

        return;

    }



    currentUserId=session.user.id;



    const {data:profile}=

    await supabaseClient

    .from("profiles")

    .select("role")

    .eq("id",session.user.id)

    .single();



    currentRole=profile.role;



    if(currentRole==="admin"){

        loadSidebar("admin");

    }

    else if(currentRole==="advertiser"){

        loadSidebar("advertiser");

    }

    else{

        loadSidebar("customer");

    }



    document.getElementById("header").innerHTML=

    await header("گفتگوی سفارش");



    const params=

    new URLSearchParams(location.search);



    chatId=params.get("id");



    if(!chatId){

        alert("چت پیدا نشد");

        history.back();

        return;

    }



    loadChatInfo();

    loadMessages();

     startRealtime();

}

async function loadChatInfo(){

    const {data:chat,error}=

    await supabaseClient

    .from("order_chats")

    .select(`
        *,
        orders(
            id,
            service_type,
            price
        )
    `)

    .eq("id",chatId)

    .single();



    if(error){

        console.log(error);

        return;

    }



    chatClosed = chat.is_closed;



    document.getElementById("chatInfo").innerHTML=`

    <div class="cardBox">

        <h2>
        💬 گفتگوی سفارش
        </h2>

        <p>
        سفارش #
        ${chat.orders.id.substring(0,8)}
        </p>

        <p>
        نوع تبلیغ:
        ${chat.orders.service_type || "-"}
        </p>

        <p>
        مبلغ:
        ${formatPrice(chat.orders.price || 0)}
        تومان
        </p>

    </div>

    `;



    // اگر گفتگو بسته باشد
    if(chatClosed){

        document.getElementById("sendBox").innerHTML=`

            <div style="text-align:center;padding:20px">

                <h3>🔒 گفتگو بسته شده است</h3>

                <p>

                این سفارش تکمیل شده و امکان ارسال پیام وجود ندارد.

                </p>

            </div>

        `;

    }

}

async function loadMessages(){

    const box = document.getElementById("messages");



    const {data:messages,error} =

    await supabaseClient

    .from("order_messages")

    .select("*")

    .eq("chat_id",chatId)

    .order("created_at",{ascending:true});



    if(error){

        console.log(error);

        return;

    }



    // خوانده شدن پیام‌های طرف مقابل

    await supabaseClient

    .from("order_messages")

    .update({

        is_read:true,

        read_at:new Date().toISOString()

    })

    .eq("chat_id",chatId)

    .neq("sender_id",currentUserId)

    .eq("is_read",false);



    box.innerHTML = "";



    messages.forEach(msg=>{

        const mine = msg.sender_id === currentUserId;

        let sender = "";



        if(msg.sender_role==="admin"){

            sender="🛠 ادمین";

        }

        else if(msg.sender_role==="advertiser"){

            sender="📢 صاحب پیج";

        }

        else{

            sender="👤 مشتری";

        }



        box.innerHTML += `

        <div class="message ${msg.sender_role} ${mine ? "mine":"other"}">

            <div class="sender">

                ${sender}

            </div>

            <div class="messageText">

                ${msg.message}

            </div>

            <span class="time">

                ${new Date(msg.created_at).toLocaleString("fa-IR",{

    timeZone:"Asia/Tehran",

    dateStyle:"medium",

    timeStyle:"short"

})}

            </span>

        </div>

        `;

    });



    box.scrollTop = box.scrollHeight;

}

async function sendMessage(){

if(chatClosed){

    alert("این گفتگو بسته شده است.");

    return;

}

    const text=

    document.getElementById("messageText")

    .value

    .trim();



    if(text===""){

        alert("پیام خالی است");

        return;

    }



    const {data:{session}}=

    await supabaseClient.auth.getSession();



    const {data:profile,error}=

    await supabaseClient

    .from("profiles")

    .select("role,name")

    .eq("id",session.user.id)

    .single();



    if(error){

        alert(error.message);

        return;

    }



    const {error:insertError}=

    await supabaseClient

    .from("order_messages")

    .insert({

        chat_id:chatId,

        sender_id:session.user.id,

        sender_role:profile.role,

        sender_name:

        profile.role==="admin"

        ? "ادمین"

        : profile.name,

        message:text

    });



    if(insertError){

        console.log(insertError);

        alert(insertError.message);

        return;

    }



    document.getElementById("messageText").value="";



    loadMessages();

}

window.sendMessage=sendMessage;

function startRealtime(){


    supabaseClient

    .channel("order-chat-"+chatId)


    .on(

        "postgres_changes",

        {

            event:"INSERT",

            schema:"public",

            table:"order_messages",

            filter:`chat_id=eq.${chatId}`

        },


        payload=>{


            console.log("NEW MESSAGE",payload);



            loadMessages();


        }

    )


    .subscribe();



}