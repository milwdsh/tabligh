document.addEventListener("DOMContentLoaded",()=>{

    loadMyTickets();

});





async function loadMyTickets(){



    const {data:{session}} =
    await supabaseClient.auth.getSession();



    if(!session){

        location.href="../login.html";

        return;

    }





const {data:profile}=await supabaseClient

.from("profiles")

.select("role")

.eq("id",session.user.id)

.single();


if(profile?.role==="admin"){

    loadSidebar("admin");

}

else if(profile?.role==="advertiser"){

    loadSidebar("advertiser");

}

else{

    loadSidebar("customer");

}


    document.getElementById("header").innerHTML =
    await header("تیکت‌های من");





    const box =
    document.getElementById("ticketsContainer");





    const {data:tickets,error}=

    await supabaseClient

    .from("tickets")

    .select("*")

    .eq("user_id",session.user.id)

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

        <h2>

        🎫 تیکتی وجود ندارد

        </h2>


        <button

        class="btn"

        onclick="location.href='create-ticket.html'">

        ➕ ارسال اولین تیکت

        </button>


        </div>

        `;


        return;

    }





    box.innerHTML="";





    tickets.forEach(ticket=>{



        box.innerHTML+=`


        <div class="cardBox ticket-card">


        <h2>

        🎫 تیکت #${ticket.ticket_number}

        </h2>



        <p>

        <b>موضوع:</b>

        ${ticket.subject}

        </p>



       

<p>

<b>تاریخ:</b>

${new Date(ticket.created_at + "Z")
.toLocaleString("fa-IR",{
    timeZone:"Asia/Tehran",
    dateStyle:"medium",
    timeStyle:"short"
})}

</p>


        <p>

        <b>وضعیت:</b>

        ${ticketStatus(ticket.status)}

        </p>





        <button

        class="btn"

        onclick="openTicket('${ticket.id}')">

        💬 مشاهده گفتگو

        </button>




        </div>


        `;



    });



}







function ticketStatus(status){



    if(status==="open")

    return "🟢 باز";



    if(status==="closed")

    return "🔴 بسته";



    return status;


}







function openTicket(id){


    location.href=

    "ticket-chat.html?id="+id;


}






window.openTicket=openTicket;