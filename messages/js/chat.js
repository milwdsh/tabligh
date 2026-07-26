let currentUser = null;
let chatId = null;
let otherUser = null;

document.addEventListener("DOMContentLoaded", () => {

    startChat();

});

async function startChat() {

    const { data: { session } } =
    await supabaseClient.auth.getSession();

    if (!session) {

        location.href = ROUTES.login;
        return;

    }

    currentUser = session.user;

    const params = new URLSearchParams(location.search);

    chatId = params.get("id");

    if (!chatId) {

        alert("شناسه گفتگو نامعتبر است.");

        location.href = "messages.html";

        return;

    }

    const { data: profile } =
    await supabaseClient

        .from("profiles")

        .select("role")

        .eq("id", currentUser.id)

        .single();

    loadSidebar(profile.role);

    document.getElementById("header").innerHTML =
    await header("گفتگو");

    await loadChatInfo();

    await loadMessages();

    subscribeMessages();

}

async function loadChatInfo(){

    const { data: chat, error } =
    await supabaseClient

        .from("private_chats")

        .select(`
            *,
            user1:profiles!private_chats_user1_fkey(
                id,
                name,
                username
            ),
            user2:profiles!private_chats_user2_fkey(
                id,
                name,
                username
            )
        `)

        .eq("id",chatId)

        .single();



    if(error){

        console.log(error);

        alert("گفتگو پیدا نشد.");

        location.href="messages.html";

        return;

    }



    otherUser =
    chat.user1.id===currentUser.id
    ? chat.user2
    : chat.user1;



    document.getElementById("chatUser").innerHTML=`

    <a

    href="profile-view.html?id=${otherUser.id}"

    style="
    text-decoration:none;
    color:inherit;
    display:flex;
    align-items:center;
    gap:10px;
    ">


        <div

        style="
        width:45px;
        height:45px;
        border-radius:50%;
        background:#e5e7eb;
        display:flex;
        align-items:center;
        justify-content:center;
        color:#64748b;
        font-size:22px;
        ">

            <i class="fa-solid fa-user"></i>

        </div>



        <div>


            <h3 style="margin:0">

                ${otherUser.name || "کاربر"}

            </h3>



            <small>

                @${otherUser.username || "بدون آیدی"}

            </small>


        </div>


    </a>

    `;


}

async function loadMessages(){

    const box =
    document.getElementById("messagesBox");


    const { data, error } =
    await supabaseClient

        .from("private_messages")

        .select("*")

        .eq("chat_id",chatId)

        .order("created_at",{ascending:true});


    if(error){

        console.log(error);

        box.innerHTML="خطا در دریافت پیام‌ها";

        return;

    }


    if(!data || data.length===0){

        box.innerHTML=`

        <div style="text-align:center;color:#888">

            هنوز پیامی ارسال نشده است.

        </div>

        `;

        return;

    }


    let html="";


    data.forEach(msg=>{


        const mine =
        msg.sender_id===currentUser.id;



        html+=`

        <div

        style="

        display:flex;

        justify-content:${mine?"flex-end":"flex-start"};

        align-items:flex-end;

        gap:8px;

        ">


        ${!mine ? `

        <div

        style="

        width:38px;

        height:38px;

        border-radius:50%;

        background:#e5e7eb;

        display:flex;

        align-items:center;

        justify-content:center;

        color:#64748b;

        flex-shrink:0;

        ">

            <i class="fa-solid fa-user"></i>

        </div>

        ` : ""}



            <div

            style="

            max-width:75%;

            background:${mine?"#2563eb":"#f3f4f6"};

            color:${mine?"#fff":"#222"};

            padding:12px;

            border-radius:14px;

            word-break:break-word;

            ">


                ${msg.message}


                <div

                style="

                margin-top:6px;

                font-size:11px;

                opacity:.7;

                ">


                ${new Date(msg.created_at)

                .toLocaleTimeString("fa-IR",{

                    hour:"2-digit",

                    minute:"2-digit"

                })}


                </div>


            </div>


        </div>


        `;


    });


    box.innerHTML=html;


    box.scrollTop=box.scrollHeight;


}

async function sendMessage(){

    const input =
    document.getElementById("messageText");

    const text =
    input.value.trim();

    if(!text){

        return;

    }

    const { error } =
    await supabaseClient

        .from("private_messages")

        .insert({

            chat_id:chatId,

            sender_id:currentUser.id,

            message:text

        });

    if(error){

        alert(error.message);

        return;

    }

    await supabaseClient

        .from("private_chats")

        .update({

            updated_at:new Date()

        })

        .eq("id",chatId);

    input.value="";

    loadMessages();

}

function subscribeMessages(){

    supabaseClient

    .channel("chat-"+chatId)

    .on(

        "postgres_changes",

        {

            event:"*",

            schema:"public",

            table:"private_messages",

            filter:`chat_id=eq.${chatId}`

        },

        ()=>{

            loadMessages();

        }

    )

    .subscribe();

}

window.sendMessage = sendMessage;
