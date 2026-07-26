let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
    startMessages();
});

async function startMessages() {

    const { data: { session } } =
        await supabaseClient.auth.getSession();

    if (!session) {

        location.href = ROUTES.login;
        return;

    }

    currentUser = session.user;

    const { data: profile } =
        await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();

    loadSidebar(profile.role);

    document.getElementById("header").innerHTML =
        await header("پیام‌ها");

    await loadChats();

}

async function loadChats(){

    const box =
        document.getElementById("chatList");

    box.innerHTML = `
        <div class="cardBox">
            در حال دریافت گفتگوها...
        </div>
    `;

    const { data, error } =
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
        .or(`user1.eq.${currentUser.id},user2.eq.${currentUser.id}`)
        .order("updated_at",{ascending:false});

    if(error){

        console.log(error);

        box.innerHTML=`
            <div class="cardBox">
                خطا در دریافت گفتگوها
            </div>
        `;

        return;

    }

    if(!data || data.length===0){

        box.innerHTML=`
            <div class="cardBox">
                هنوز هیچ گفتگویی ندارید.
            </div>
        `;

        return;

    }

    let html="";

    data.forEach(chat=>{

        const other =
            chat.user1.id===currentUser.id
            ? chat.user2
            : chat.user1;

        html+=`

        <div class="cardBox clickable"

        onclick="openChat('${chat.id}')">

            <h3>

                👤 ${other.name}

            </h3>

            <p>

                @${other.username}

            </p>

        </div>

        `;

    });

    box.innerHTML=html;

}

async function searchUser(){

    const username =
    document.getElementById("searchUsername")
    .value
    .trim()
    .toLowerCase();

    if(!username){

        alert("آیدی کاربر را وارد کنید.");

        return;

    }

    const box =
    document.getElementById("searchResult");

    box.innerHTML = `
    <div class="cardBox">
    در حال جستجو...
    </div>
    `;

    const { data:user,error } =
    await supabaseClient

        .from("profiles")

        .select("id,name,username,role")

        .eq("username",username)

        .maybeSingle();

    if(error){

        console.log(error);

        box.innerHTML="";

        return;

    }

    if(!user){

        box.innerHTML=`

        <div class="cardBox">

        کاربری با این آیدی پیدا نشد.

        </div>

        `;

        return;

    }

    if(user.id===currentUser.id){

        box.innerHTML=`

        <div class="cardBox">

        این حساب کاربری خودتان است.

        </div>

        `;

        return;

    }

    box.innerHTML=`

    <div class="cardBox">

        <h3>

        👤 ${user.name}

        </h3>

        <p>

        @${user.username}

        </p>

        <br>

        <button
        class="btn"
        onclick="startChat('${user.id}')">

        <i class="fa-solid fa-comments"></i>

        شروع گفتگو

        </button>

    </div>

    `;

}

window.searchUser = searchUser;

async function startChat(otherUserId){

    // اول بررسی می‌کنیم قبلاً چتی وجود دارد یا نه

    const { data: chats, error } =
    await supabaseClient

        .from("private_chats")

        .select("*")

        .or(

            `and(user1.eq.${currentUser.id},user2.eq.${otherUserId}),` +

            `and(user1.eq.${otherUserId},user2.eq.${currentUser.id})`

        )

        .limit(1);

    if(error){

        console.log(error);

        alert("خطا در شروع گفتگو");

        return;

    }

    let chatId;

    if(chats && chats.length){

        chatId = chats[0].id;

    }else{

        // اگر وجود نداشت، ایجاد می‌کنیم

        const { data:newChat, error:createError } =
        await supabaseClient

            .from("private_chats")

            .insert({

                user1: currentUser.id,

                user2: otherUserId

            })

            .select()

            .single();

        if(createError){

            console.log(createError);

            alert("خطا در ایجاد گفتگو");

            return;

        }

        chatId = newChat.id;

    }

    location.href =
    `chat.html?id=${chatId}`;

}

window.startChat = startChat;

window.openChat = function(id){

    location.href =
    `chat.html?id=${id}`;

};