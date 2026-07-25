function link(path){

if(
    window.location.pathname.includes("/customer/") ||
    window.location.pathname.includes("/advertiser/") ||
    window.location.pathname.includes("/admin/") ||
    window.location.pathname.includes("/tickets/") ||
    window.location.pathname.includes("/chat/")
){

    return "../" + path;

}


    return path;

}







function loadSidebar(role){


const sidebar = document.getElementById("sidebar");


if(!sidebar){

    return;

}




let menu = `

<div class="sidebar">

<button id="closeMenuBtn" class="closeMenuBtn">

    <i class="fa-solid fa-xmark"></i>

</button>

<h2>

تبلیغینو

</h2>

`;






// داشبورد

if(role==="admin"){


menu += `

<a href="${link("admin/admin.html")}">

<i class="fa fa-home"></i>

داشبورد

</a>

`;


}
else if(role==="advertiser"){


menu += `

<a href="${link("advertiser/advertiser.html")}">

<i class="fa fa-home"></i>

داشبورد

</a>

`;

}
else{


menu += `

<a href="${link("dashboard.html")}">

<i class="fa fa-home"></i>

داشبورد

</a>

`;

}









// مشتری

if(role==="customer"){


menu += `


<a href="${link("customer/pages.html")}">

<i class="fa fa-instagram"></i>

پیج‌های تبلیغاتی

</a>



<a href="${link("customer/customer-orders.html")}">

<i class="fa fa-list"></i>

سفارش‌های من

</a>



<a href="${link("tickets/my-tickets.html")}">

<i class="fa fa-ticket"></i>

تیکت های پشتیبانی

</a>


`;

}









// صاحب پیج

if(role==="advertiser"){


menu += `


<a href="${link("advertiser/register-page.html")}">

<i class="fa fa-plus"></i>

ثبت پیج

</a>





<a href="${link("advertiser/orders.html")}">

<i class="fa fa-list"></i>

سفارش‌ها

</a>





<a href="${link("advertiser/wallet.html")}">

<i class="fa fa-wallet"></i>

کیف پول

</a>





<a href="${link("tickets/my-tickets.html")}">

<i class="fa fa-ticket"></i>

تیکت های پشتیبانی

</a>



`;

}









// ادمین

if(role==="admin"){


menu += `



<a href="${link("admin/admin-orders.html")}">

<i class="fa fa-shopping-cart"></i>

سفارش‌ها

</a>





<a href="${link("admin/admin-review-orders.html")}">

<i class="fa fa-instagram"></i>

بررسی تبلیغات انجام شده

</a>





<a href="${link("admin/admin-pages.html")}">

<i class="fa fa-instagram"></i>

بررسی پیج‌ها

</a>





<a href="${link("admin/approved-pages.html")}">

<i class="fa fa-check"></i>

پیج‌های تایید شده

</a>



<a href="${link("admin/admin-order-chats.html")}">

<i class="fa fa-check"></i>

گفتگو های فعال

</a>


<a href="${link("admin/withdrawals.html")}">

<i class="fa fa-wallet"></i>

تسویه حساب

</a>





<a href="${link("admin/admin-tickets.html")}">

<i class="fa fa-ticket"></i>

مدیریت تیکت‌ها

</a>



`;

}










menu += `


<a href="${link("profile.html")}">

<i class="fa-solid fa-user-circle"></i>

پروفایل

</a>


<a href="${link("support.html")}">

<i class="fa fa-headset"></i>

پشتیبانی

</a>






<a href="${link("index.html")}" onclick="logout()">

<i class="fa fa-sign-out"></i>

خروج

</a>





</div>

`;





sidebar.innerHTML = menu;



}









async function header(title){

    const {data:{session}} =
    await supabaseClient.auth.getSession();

    let name = "";

    if(session){

        const {data:profile} = await supabaseClient

        .from("profiles")

        .select("name")

        .eq("id",session.user.id)

        .single();

        name = profile?.name || "";
    }

    return `

    <header class="topHeader">

        <button id="menuBtn" class="menuBtn">

            <i class="fa-solid fa-bars"></i>

        </button>

        <h2>${title}</h2>

<div class="userInfo" onclick="window.location.href=link('profile.html')">

    <i class="fa-solid fa-user-circle"></i>

    <span>${name}</span>

</div>

    </header>

    `;
}

document.addEventListener("click",(e)=>{

    if(e.target.closest("#menuToggle")){

        document.body.classList.toggle("sidebarOpen");

    }

});

document.addEventListener("click",function(e){


    if(e.target.closest("#menuBtn")){

        document.body.classList.add("sidebarOpen");

    }


    if(e.target.closest("#closeMenuBtn")){

        document.body.classList.remove("sidebarOpen");

    }


});