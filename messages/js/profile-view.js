document.addEventListener("DOMContentLoaded",()=>{

    startProfileView();

});



async function startProfileView(){


    await header("پروفایل کاربر");


    const {data:{session}} =
    await supabaseClient.auth.getSession();


    if(!session){

        window.location.href = ROUTES.login;

        return;

    }



    const {data:myProfile} =
    await supabaseClient

    .from("profiles")

    .select("role")

    .eq("id",session.user.id)

    .single();



    if(myProfile){

        await loadSidebar(myProfile.role);

    }



    const params =
    new URLSearchParams(window.location.search);


    const userId =
    params.get("id");



    if(!userId){

        document.getElementById("userName").innerHTML =
        "کاربر پیدا نشد";

        return;

    }



    await loadUserProfile(userId);


}





async function loadUserProfile(userId){


    const {data:profile,error} =

    await supabaseClient

    .from("profiles")

    .select("*")

    .eq("id",userId)

    .single();



    if(error || !profile){


        document.getElementById("userName").innerHTML =
        "کاربر پیدا نشد";


        return;

    }



    document.getElementById("userName").innerText =
    profile.name || "بدون نام";



    document.getElementById("username").innerHTML =

    profile.username ?

    "@" + profile.username :

    "";



    document.getElementById("userRole").innerText =
    getRoleName(profile.role);



    document.getElementById("createdAt").innerText =

    new Date(profile.created_at)

    .toLocaleDateString("fa-IR");



    if(profile.role === "advertiser"){


        await loadAdvertiserPages(profile.id);


    }else{


        document.getElementById("pagesSection").style.display =
        "none";


    }


}

function getRoleName(role){


    switch(role){


        case "admin":

            return "🛡 مدیر سایت";


        case "advertiser":

            return "📢 صاحب پیج تبلیغاتی";


        case "customer":

            return "👤 مشتری";


        default:

            return "-";


    }


}




async function loadAdvertiserPages(userId){


    const container =
    document.getElementById("pagesContainer");



    const {data:pages,error} =

    await supabaseClient

    .from("advertiser_pages")

    .select("*")

    .eq("user_id",userId)

    .eq("status","approved");



    if(error){

        console.log(error);

        container.innerHTML =
        "خطا در دریافت پیج‌ها";

        return;

    }



    if(!pages || pages.length===0){


        container.innerHTML =

        `

        <div class="cardBox">

        پیج تایید شده‌ای وجود ندارد.

        </div>

        `;


        return;


    }




    let html="";



    pages.forEach(page=>{


        html += `


        <div class="cardBox">


        <h3>

        📷 ${page.page_name}

        </h3>



        <p>

        آیدی اینستاگرام:

        <b>

        ${page.instagram_id}

        </b>

        </p>



        <p>

        دنبال کننده:

        <b>

        ${page.followers || 0}

        </b>

        </p>



        <hr>



        <p>

        استوری:

        <b>

        ${page.story_price || 0}

        </b>

        تومان

        </p>



        <p>

        پست:

        <b>

        ${page.post_price || 0}

        </b>

        تومان

        </p>



        <p>

        ریلز:

        <b>

        ${page.reel_price || 0}

        </b>

        تومان

        </p>




        <a href="../customer/order.html?page=${page.id}">


        <button class="btn">

        <i class="fa-solid fa-cart-shopping"></i>

        ثبت سفارش تبلیغ

        </button>


        </a>



        </div>


        `;


    });



    container.innerHTML = html;


}