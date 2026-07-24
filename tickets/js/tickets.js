document.addEventListener("DOMContentLoaded",()=>{

loadTickets();

});



async function loadTickets(){


const {data:{session}} =
await supabaseClient.auth.getSession();


if(!session){

location.href=ROUTES.login;

return;

}



loadSidebar("customer");


document.getElementById("header").innerHTML =
 await header("تیکت‌های من");



const {data:tickets,error}=await supabaseClient

.from("tickets")

.select("*")

.eq("user_id",session.user.id)

.order("created_at",{ascending:false});



const box=document.getElementById("ticketsContainer");



if(error){

box.innerHTML=error.message;

return;

}



if(!tickets || tickets.length===0){

box.innerHTML="تیکتی وجود ندارد";

return;

}



box.innerHTML="";



tickets.forEach(ticket=>{


box.innerHTML+=`

<div class="cardBox">


<h3>

${ticket.subject}

</h3>


<p>

وضعیت:

${ticket.status}

</p>


<button class="btn"

onclick="location.href='ticket-details.html?id=${ticket.id}'">

مشاهده

</button>


</div>


`;


});


}
