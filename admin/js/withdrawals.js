document.addEventListener("DOMContentLoaded",()=>{

    startWithdrawals();

});



async function startWithdrawals(){


    const {data:{session}} =
    await supabaseClient.auth.getSession();



    if(!session){

        location.href=ROUTES.login;

        return;

    }



    const {data:profile,error}=

    await supabaseClient

    .from("profiles")

    .select("role")

    .eq("id",session.user.id)

    .single();



    if(error || !profile || profile.role !== "admin"){

        alert("دسترسی ندارید");

        location.href=ROUTES.dashboard;

        return;

    }



    loadSidebar("admin");



    document.getElementById("header").innerHTML =

    await header("مدیریت تسویه‌ها");



    loadWithdrawals();

}





async function loadWithdrawals(){


    const box=document.getElementById(
        "withdrawalsContainer"
    );



    const {data,error}=

    await supabaseClient

    .from("withdrawal_requests")

    .select("*")

    .order("created_at",{ascending:false});



    if(error){

        box.innerHTML=error.message;

        console.log(error);

        return;

    }



    if(!data || data.length===0){

        box.innerHTML="درخواستی وجود ندارد";

        return;

    }



    box.innerHTML="";



    for(const item of data){


        const {data:user}=await supabaseClient

.from("profiles")

.select("email")

.eq("id",item.user_id)

.maybeSingle();


const {data:wallet}=await supabaseClient

.from("wallets")

.select("balance")

.eq("user_id",item.user_id)

.maybeSingle();
        box.innerHTML+=`

        <div class="cardBox">


        <h3>
        💸 درخواست تسویه
        </h3>



        <p>
        👤 کاربر:

        ${user?.email || "-"}

        </p>



        <p>
        💰 مبلغ:

        ${formatPrice(item.amount)}

        تومان

        </p>

<p>

💼 موجودی فعلی:

${formatPrice(wallet?.balance || 0)}

تومان

</p>

        <p>
        👨 نام حساب:

        ${item.card_name || "-"}

        </p>



        <p>
        💳 کارت:

        ${item.card_number || "-"}

        </p>



        <p>
        وضعیت:

        ${withdrawStatus(item.status)}

        </p>




        ${
        item.status==="pending"

        ?

        `

        <button class="btn"

        onclick="approveWithdraw('${item.id}')">

        ✅ تایید پرداخت

        </button>



        <button class="btn danger"

        onclick="rejectWithdraw('${item.id}')">

        ❌ رد درخواست

        </button>


        `

        :

        ""

        }



        </div>


        `;


    }


}
async function approveWithdraw(id){


    if(!confirm("پرداخت انجام شد؟")){

        return;

    }



    const {data:req,error:reqError}=

    await supabaseClient

    .from("withdrawal_requests")

    .select("*")

    .eq("id",id)

    .single();



    if(reqError){

        alert(reqError.message);

        return;

    }




    // گرفتن کیف پول

    const {data:wallet,error:walletError}=

    await supabaseClient

    .from("wallets")

    .select("*")

    .eq("user_id",req.user_id)

    .maybeSingle();




    if(walletError){

        alert(walletError.message);

        return;

    }




    if(!wallet){

        alert("کیف پول پیدا نشد");

        return;

    }





    // کم کردن موجودی

    const {error:updateError}=

    await supabaseClient

    .from("wallets")

    .update({

        balance:
        Number(wallet.balance || 0)
        -
        Number(req.amount || 0)

    })

    .eq("id",wallet.id);




    if(updateError){

        alert(updateError.message);

        return;

    }





    // ثبت تراکنش تسویه

    const {error:transError}=

    await supabaseClient

    .from("transactions")

    .insert({

        user_id:req.user_id,

        amount:-Number(req.amount),

        type:"withdrawal_paid",

        status:"completed",

        description:"تسویه پرداخت شد"

    });




    if(transError){

        alert(transError.message);

        return;

    }





    // تغییر وضعیت درخواست

    const {error:statusError}=

    await supabaseClient

    .from("withdrawal_requests")

    .update({

        status:"approved"

    })

    .eq("id",id);




    if(statusError){

        alert(statusError.message);

        return;

    }





    alert("تسویه تایید شد");


    loadWithdrawals();


}






async function rejectWithdraw(id){


    if(!confirm("درخواست رد شود؟")){

        return;

    }



    const {error}=

    await supabaseClient

    .from("withdrawal_requests")

    .update({

        status:"rejected"

    })

    .eq("id",id);




    if(error){

        alert(error.message);

        return;

    }



    alert("درخواست رد شد");


    loadWithdrawals();


}





function withdrawStatus(status){


    if(status==="pending")

        return "⏳ در انتظار تایید";



    if(status==="approved")

        return "✅ پرداخت شده";



    if(status==="rejected")

        return "❌ رد شده";



    return status || "-";

}





window.approveWithdraw = approveWithdraw;

window.rejectWithdraw = rejectWithdraw;
