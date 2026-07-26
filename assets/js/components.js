function link(path){

    const current = window.location.pathname;

    if(
        current.includes("/customer/") ||
        current.includes("/advertiser/") ||
        current.includes("/admin/") ||
        current.includes("/tickets/") ||
        current.includes("/chat/") ||
        current.includes("/messages/")
    ){
        return "../" + path;
    }

    return path;

}



function menuItem(href, icon, text){

    return `
        <a href="${link(href)}">
            <i class="${icon}"></i>
            <span>${text}</span>
        </a>
    `;

}



function loadSidebar(role){

    const sidebar = document.getElementById("sidebar");

    if(!sidebar) return;

    let menu = `
        <div id="sidebarOverlay" class="sidebarOverlay"></div>

        <aside class="sidebar">

            <button id="closeMenuBtn" class="closeMenuBtn">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <div class="sidebarLogo">
                <h2>تبلیغینو</h2>
            </div>

            <nav>
    `;

    /* داشبورد */

    if(role==="admin")
        menu += menuItem("admin/admin.html","fa-solid fa-house","داشبورد");

    else if(role==="advertiser")
        menu += menuItem("advertiser/advertiser.html","fa-solid fa-house","داشبورد");

    else
        menu += menuItem("dashboard.html","fa-solid fa-house","داشبورد");



    /* مشتری */

    if(role==="customer"){

        menu += menuItem("customer/pages.html","fa-brands fa-instagram","پیج‌های تبلیغاتی");

        menu += menuItem("customer/customer-orders.html","fa-solid fa-list","سفارش‌های من");

        menu += menuItem("tickets/my-tickets.html","fa-solid fa-ticket","تیکت‌های پشتیبانی");

    }



    /* صاحب پیج */

    if(role==="advertiser"){

        menu += menuItem("advertiser/register-page.html","fa-solid fa-plus","ثبت پیج");

        menu += menuItem("advertiser/orders.html","fa-solid fa-list","سفارش‌ها");

        menu += menuItem("advertiser/wallet.html","fa-solid fa-wallet","کیف پول");

        menu += menuItem("tickets/my-tickets.html","fa-solid fa-ticket","تیکت‌های پشتیبانی");

    }



    /* ادمین */

    if(role==="admin"){

        menu += menuItem("admin/admin-orders.html","fa-solid fa-cart-shopping","سفارش‌ها");

        menu += menuItem("admin/admin-review-orders.html","fa-brands fa-instagram","بررسی تبلیغات");

menu += menuItem("admin/admin-users.html","fa-solid fa-users-gear","مدیریت کاربران");

        menu += menuItem("admin/admin-pages.html","fa-solid fa-users","بررسی پیج‌ها");

        menu += menuItem("admin/approved-pages.html","fa-solid fa-circle-check","پیج‌های تایید شده");

        menu += menuItem("admin/admin-order-chats.html","fa-solid fa-comments","گفتگوهای فعال");

        menu += menuItem("admin/withdrawals.html","fa-solid fa-wallet","تسویه حساب");

        menu += menuItem("admin/admin-tickets.html","fa-solid fa-ticket","مدیریت تیکت‌ها");

    }



    /* عمومی */

    menu += menuItem("profile.html","fa-solid fa-user","پروفایل");

menu += menuItem("messages/messages.html","fa-solid fa-comments","پیام‌ها");

    menu += menuItem("support.html","fa-solid fa-headset","پشتیبانی");

    menu += `
        <a href="${link("index.html")}" onclick="logout()">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>خروج</span>
        </a>
    `;

    menu += `
            </nav>
        </aside>
    `;

    sidebar.innerHTML = menu;

}

async function header(title){

    const {data:{session}} =
    await supabaseClient.auth.getSession();

    let name="";

    if(session){

        const {data:profile}=await supabaseClient
        .from("profiles")
        .select("name")
        .eq("id",session.user.id)
        .single();

        name=profile?.name || "";

    }

    return `

<header class="topHeader">

    <button id="menuBtn" class="menuBtn">

        <i class="fa-solid fa-bars"></i>

    </button>

    <h2 class="pageTitle">${title}</h2>

    <div class="userInfo" onclick="window.location.href=link('profile.html')">

        <i class="fa-solid fa-user-circle"></i>

        <span>${name}</span>

    </div>

</header>

`;

}

document.addEventListener("click",function(e){

    const sidebar=document.querySelector(".sidebar");
    const overlay=document.getElementById("sidebarOverlay");

    if(e.target.closest("#menuBtn")){

        sidebar?.classList.add("show");
        overlay?.classList.add("show");

    }

    if(
        e.target.closest("#closeMenuBtn") ||
        e.target.closest("#sidebarOverlay")
    ){

        sidebar?.classList.remove("show");
        overlay?.classList.remove("show");

    }

});