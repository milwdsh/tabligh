document.addEventListener("DOMContentLoaded", () => {

    startReviewOrders();

});


async function startReviewOrders(){

    const {data:{session}}=
    await supabaseClient.auth.getSession();


    if(!session){

        location.href=ROUTES.login;

        return;

    }


    const {data:profile}=await supabaseClient

    .from("profiles")

    .select("role")

    .eq("id",session.user.id)

    .single();


    if(!profile || profile.role!=="admin"){

        alert("دسترسی ندارید");

        location.href=ROUTES.dashboard;

        return;

    }


    loadSidebar("admin");


    document.getElementById("header").innerHTML=
    await header("بررسی تبلیغات انجام شده");


    loadReviewOrders();

}



async function loadReviewOrders(){


    const container=
    document.getElementById("ordersContainer");


    const {data:orders,error}=await supabaseClient

    .from("orders")

    .select("*")

    .eq("status","waiting_admin_check")

    .order("created_at",{ascending:false});


    if(error){

        container.innerHTML=`

        <div class="cardBox">

        خطا در دریافت سفارش‌ها

        </div>

        `;

        console.log(error);

        return;

    }


    if(!orders || orders.length===0){

        container.innerHTML=`

        <div class="cardBox">

        هیچ تبلیغی برای بررسی وجود ندارد.

        </div>

        `;

        return;

    }


    container.innerHTML="";


    for(const order of orders){


        const {data:page}=await supabaseClient

        .from("advertiser_pages")

        .select("page_name,instagram_id")

        .eq("id",order.advertiser_page_id)

        .single();


        container.innerHTML+=`

        <div class="cardBox">

        <h2>

        سفارش #${order.id.substring(0,8)}

        </h2>


        <p>

        <b>پیج:</b>

        ${page?.page_name || "-"}

        </p>


        <p>

        <b>اینستاگرام:</b>

        @${page?.instagram_id || "-"}

        </p>


        <p>

        <b>نوع تبلیغ:</b>

        ${order.service_type}

        </p>


        <p>

        <b>مبلغ:</b>

        ${formatPrice(order.price)}

        تومان

        </p>


        <p>

        <b>لینک تبلیغ:</b>

        <a
class="btn"
href="${order.proof_link}"
target="_blank">

🔗 مشاهده تبلیغ

</a>

        </p>


        <p>

        <b>توضیحات:</b>

        ${order.proof_note || "-"}

        </p>


        <div class="actions">

        <button class="btn"

        onclick="approveOrder('${order.id}')">

        ✅ تایید تبلیغ

        </button>


        <button class="btn danger"

        onclick="rejectOrder('${order.id}')">

        ❌ رد تبلیغ

        </button>

        </div>


        </div>

        `;

    }

}


async function approveOrder(id){

    if(!confirm("تبلیغ تایید شود؟")) return;


    const COMMISSION_PERCENT = 15;


    // اطلاعات سفارش
    const {data:order,error:orderError}=await supabaseClient

    .from("orders")

    .select("advertiser_page_id,price")

    .eq("id",id)

    .maybeSingle();


    if(orderError || !order){

        alert("خطا در دریافت سفارش");

        console.log(orderError);

        return;

    }



    const totalPrice = Number(order.price || 0);


    const adminAmount =
    Math.round(totalPrice * COMMISSION_PERCENT / 100);


    const advertiserAmount =
    totalPrice - adminAmount;




    // اطلاعات صاحب پیج
    const {data:page,error:pageError}=await supabaseClient

    .from("advertiser_pages")

    .select("user_id")

    .eq("id",order.advertiser_page_id)

    .maybeSingle();



    if(pageError || !page){

        alert("صاحب پیج پیدا نشد");

        console.log(pageError);

        return;

    }




    // کیف پول صاحب پیج
    const {data:wallet,error:walletError}=await supabaseClient

    .from("wallets")

    .select("balance")

    .eq("user_id",page.user_id)

    .maybeSingle();



    if(walletError || !wallet){

        alert("کیف پول صاحب پیج پیدا نشد");

        console.log(walletError);

        return;

    }





    // افزایش کیف پول صاحب پیج

    const {error:updateWalletError}=await supabaseClient

    .from("wallets")

    .update({

        balance:Number(wallet.balance || 0)+advertiserAmount

    })

    .eq("user_id",page.user_id);



    if(updateWalletError){

        alert(updateWalletError.message);

        return;

    }





    // ثبت درآمد صاحب پیج

    const {error:advertiserTransactionError}=await supabaseClient

    .from("transactions")

    .insert({

        user_id:page.user_id,

        amount:advertiserAmount,

        type:"advertiser_income",

        status:"completed",

        description:`درآمد سفارش #${id.substring(0,8)}`,

        order_id:id

    });



    if(advertiserTransactionError){

        alert(advertiserTransactionError.message);

        console.log(advertiserTransactionError);

        return;

    }





    // ثبت درآمد سایت

    const {error:adminTransactionError}=await supabaseClient

    .from("transactions")

    .insert({

        amount:adminAmount,

        type:"admin_income",

        status:"completed",

        description:`کمیسیون سفارش #${id.substring(0,8)}`,

        order_id:id

    });



    if(adminTransactionError){

        alert(adminTransactionError.message);

        console.log(adminTransactionError);

        return;

    }





    // تکمیل سفارش

    const {error:updateOrderError}=await supabaseClient

    .from("orders")

    .update({

        status:"completed",

        completed_at:new Date().toISOString()

    })

    .eq("id",id);



    if(updateOrderError){

        alert(updateOrderError.message);

        return;

    }


// بستن چت سفارش

const {error:closeChatError}=await supabaseClient

.from("order_chats")

.update({

    is_closed:true,

    closed_at:new Date().toISOString()

})

.eq("order_id",id);



if(closeChatError){

    console.log(closeChatError);

}



    alert(
    "تبلیغ تایید شد\n\n"+
    "درآمد صاحب پیج: "+
    formatPrice(advertiserAmount)+
    " تومان\n"+
    "کمیسیون سایت: "+
    formatPrice(adminAmount)+
    " تومان"
    );



    loadReviewOrders();

}


window.approveOrder = approveOrder;