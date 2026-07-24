document.addEventListener("DOMContentLoaded",()=>{

    startAdminDashboard();

});





async function startAdminDashboard(){



    const {data:{session}} =

    await supabaseClient.auth.getSession();





    if(!session){

        window.location.href="../login.html";

        return;

    }





    const {data:profile,error}=

    await supabaseClient

    .from("profiles")

    .select("role")

    .eq("id",session.user.id)

    .single();





    if(error || !profile){

        alert("خطا در دریافت اطلاعات");

        return;

    }





    if(profile.role!=="admin"){

        alert("دسترسی غیرمجاز");

        return;

    }





    loadSidebar("admin");





    document.getElementById("header").innerHTML=

      await header("داشبورد مدیریت");





    loadAdminStats();
    loadAdminNotice();




}









async function loadAdminStats(){



    // تعداد کاربران


    const {count:usersCount}=

    await supabaseClient

    .from("profiles")

    .select("*",{count:"exact",head:true});





    document.getElementById("usersCount").innerText=

    usersCount || 0;







    // تعداد سفارش ها


    const {count:ordersCount}=

    await supabaseClient

    .from("orders")

    .select("*",{count:"exact",head:true});





    document.getElementById("ordersCount").innerText=

    ordersCount || 0;







    // تعداد تیکت های باز


    const {count:ticketsCount}=

    await supabaseClient

    .from("tickets")

    .select("*",{count:"exact",head:true})

    .eq("status","open");





    document.getElementById("ticketsCount").innerText=

    ticketsCount || 0;


// درآمد سایت از تراکنش های کمیسیون

const {data:income,error:incomeError}=

await supabaseClient

.from("transactions")

.select("amount")

.eq("type","admin_income")

.eq("status","completed");



if(incomeError){

    console.log(incomeError);

    document.getElementById("siteRevenue").innerText = 0;

    return;

}



let revenue = 0;



if(income){

    income.forEach(item=>{

        revenue += Number(item.amount || 0);

    });

}



document.getElementById("siteRevenue").innerText =

formatPrice(revenue);

}


async function loadAdminNotice(){


const box =
document.getElementById("adminNotice");


if(!box) return;




const {data:tickets,error}=

await supabaseClient

.from("tickets")

.select("id,ticket_number")
.order("created_at",{ascending:false});





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





if(
lastMessage &&
lastMessage.sender_role!=="admin"
){


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

در تیکت شماره

<b>
#${found.ticket_number}
</b>

پیام جدید دارید.

</p>



<button

class="btn"

onclick="location.href='../tickets/ticket-chat.html?id=${found.id}'">

مشاهده تیکت

</button>



</div>

`;



}
