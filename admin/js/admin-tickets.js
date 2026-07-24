document.addEventListener("DOMContentLoaded",()=>{

    startAdminTickets();

});





async function startAdminTickets(){


    const {data:{session}} =
    await supabaseClient.auth.getSession();



    if(!session){

        location.href="../login.html";

        return;

    }





    const {data:profile,error}=

    await supabaseClient

    .from("profiles")

    .select("role")

    .eq("id",session.user.id)

    .single();





    if(error || !profile || profile.role!=="admin"){

        alert("دسترسی ندارید");

        location.href="../dashboard.html";

        return;

    }





    loadSidebar("admin");



    document.getElementById("header").innerHTML=

    await header("مدیریت تیکت‌ها");





    loadAdminTickets();


}









async function loadAdminTickets(){



    const box =
    document.getElementById("ticketsContainer");





    const {data:tickets,error}=

    await supabaseClient

    .from("tickets")

    .select("*")

    .order("created_at",{ascending:false});





    if(error){

        console.log(error);

        box.innerHTML=`

        <div class="cardBox">

        خطا در دریافت تیکت‌ها

        </div>

        `;

        return;

    }





    if(!tickets || tickets.length===0){

        box.innerHTML=`

        <div class="cardBox">

        تیکتی وجود ندارد

        </div>

        `;

        return;

    }





    box.innerHTML="";





    for(const ticket of tickets){



        const {data:user}=

        await supabaseClient

        .from("profiles")

        .select("email")

        .eq("id",ticket.user_id)

        .single();






        box.innerHTML+=`



        <div class="cardBox">



        <h2>

        🎫 تیکت #${ticket.ticket_number}

        </h2>




        <p>

        👤 کاربر:

        ${user?.email || "-"}

        </p>





        <p>

        📝 موضوع:

        ${ticket.subject}

        </p>





        <p>

        🕒 تاریخ:

        ${new Date(ticket.created_at+"Z")

        .toLocaleString("fa-IR",{

        timeZone:"Asia/Tehran",

        dateStyle:"medium",

        timeStyle:"short"

        })}

        </p>





        <p>

        وضعیت:

        ${ticketStatus(ticket.status)}

        </p>





        <button

        class="btn"

        onclick="openAdminTicket('${ticket.id}')">

        💬 مشاهده گفتگو

        </button>



        </div>



        `;



    }



}









function ticketStatus(status){


    if(status==="open")

    return "🟢 باز";


    if(status==="closed")

    return "🔴 بسته";


    return status;


}







function openAdminTicket(id){


    location.href=

    "../tickets/ticket-chat.html?id="+id;


}





window.openAdminTicket=openAdminTicket;