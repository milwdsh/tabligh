document.addEventListener("DOMContentLoaded",()=>{

    startTicketChat();

});


let ticketId = null;
let currentRole = "";





async function startTicketChat(){


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





    if(error || !profile){

        alert("خطا در دریافت نقش کاربر");

        return;

    }





    currentRole = profile.role;





    if(profile.role==="admin"){

        loadSidebar("admin");

    }

    else if(profile.role==="advertiser"){

        loadSidebar("advertiser");

    }

    else{

        loadSidebar("customer");

    }





    document.getElementById("header").innerHTML =
    await header("گفتگوی تیکت");





    const params = new URLSearchParams(
        window.location.search
    );


    ticketId = params.get("id");





    if(!ticketId){

        alert("تیکت پیدا نشد");

        backToTickets();

        return;

    }





    loadTicketInfo();

    loadMessages();



}









async function loadTicketInfo(){


    const {data:ticket,error}=

    await supabaseClient

    .from("tickets")

    .select("*")

    .eq("id",ticketId)

    .single();





    if(error){

        console.log(error);

        return;

    }

ticketStatusValue = ticket.status;
if(ticket.status === "closed"){
    document.getElementById("messageText").disabled = true;
    document.querySelector(".sendBtn").disabled = true;
}


    document.getElementById("ticketInfo").innerHTML=`

    <h3>

    🎫 تیکت #${ticket.ticket_number}

    </h3>


    <p>

    موضوع:

    ${ticket.subject}

    </p>


    <p>

    وضعیت:

    ${ticket.status==="open" ? "🟢 باز" : "🔴 بسته"}

    </p>

    `;


}









async function loadMessages(){


    const box =
    document.getElementById("messages");



    const {data:{session}} =
    await supabaseClient.auth.getSession();





    const {data:messages,error}=

    await supabaseClient

    .from("ticket_messages")

    .select("*")

    .eq("ticket_id",ticketId)

    .order("created_at",{ascending:true});





    if(error){

        box.innerHTML=error.message;

        return;

    }





    box.innerHTML="";





    messages.forEach(msg=>{



        let role = msg.sender_role || "customer";



        let sender = "";



        if(role==="admin"){

            sender="🛠 ادمین";

        }


        else if(role==="advertiser"){

            sender=`

            📢 ${msg.sender_name || "صاحب پیج"}

            <br>

            <small>صاحب پیج</small>

            `;

        }


        else{


            sender=`

            👤 ${msg.sender_name || "مشتری"}

            <br>

            <small>مشتری</small>

            `;


        }







        const mine =

        msg.sender_id === session.user.id;







        box.innerHTML += `


        <div class="message ${role} ${mine ? "mine":"other"}">


            <div class="sender">

            ${sender}

            </div>



            <div class="message-text">

            ${msg.message}

            </div>



            <span class="time">

            ${new Date(msg.created_at+"Z")

            .toLocaleString("fa-IR",{

                timeZone:"Asia/Tehran",

                dateStyle:"medium",

                timeStyle:"short"

            })}

            </span>



        </div>


        `;



    });





    box.scrollTop = box.scrollHeight;



}









async function sendMessage(){

if(ticketStatusValue === "closed"){
    alert("این تیکت بسته شده است.");
    return;
}

    const text =

    document.getElementById("messageText")

    .value

    .trim();





    if(!text){

        alert("پیام خالی است");

        return;

    }





    const {data:{session}} =

    await supabaseClient.auth.getSession();





    const {data:profile,error}=

    await supabaseClient

    .from("profiles")

    .select("role,name")

    .eq("id",session.user.id)

    .single();





    if(error){

        alert(error.message);

        return;

    }





    const {error:insertError}=

    await supabaseClient

    .from("ticket_messages")

    .insert({

        ticket_id:ticketId,

        sender_id:session.user.id,

        sender_role:profile.role,

        sender_name:

        profile.role==="admin"

        ?

        "ادمین"

        :

        (profile.name || "کاربر"),

        message:text

    });





    if(insertError){

        alert(insertError.message);

        return;

    }





    document.getElementById("messageText").value="";



    loadMessages();



}









function backToTickets(){



    if(currentRole==="admin"){


        location.href="../admin/admin-tickets.html";


    }

    else{


        location.href="my-tickets.html";


    }


}






window.backToTickets=backToTickets;

window.sendMessage=sendMessage;