document.addEventListener("DOMContentLoaded", async ()=>{


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
    await header("ارسال تیکت");


});









async function sendTicket(){



    const subject =

    document.getElementById("subject")

    .value

    .trim();





    const message =

    document.getElementById("message")

    .value

    .trim();





    if(!subject || !message){

        alert("موضوع و پیام را کامل کنید");

        return;

    }







    const {data:{session}} =

    await supabaseClient.auth.getSession();





    if(!session){

        alert("کاربر وارد نشده");

        return;

    }









    // گرفتن اطلاعات کاربر

    const {data:profile,error:profileError}=

    await supabaseClient

    .from("profiles")

    .select("role,name")

    .eq("id",session.user.id)

    .single();





    if(profileError){

        alert("خطا در دریافت اطلاعات کاربر");

        return;

    }









    // ساخت تیکت

    const {data:ticket,error}=

    await supabaseClient

    .from("tickets")

    .insert({

        user_id:session.user.id,

        subject:subject,

        status:"open"

    })

    .select("*")

    .single();









    if(error){

        alert(error.message);

        return;

    }









    // پیام اول تیکت

    const {error:messageError}=

    await supabaseClient

    .from("ticket_messages")

    .insert({

        ticket_id:ticket.id,

        sender_id:session.user.id,

        sender_role:profile.role,

        sender_name:

        profile.role==="admin"

        ?

        "ادمین"

        :

        profile.name,

        message:message

    });









    if(messageError){

        alert(messageError.message);

        return;

    }









    alert(

        "تیکت شما با شماره #"

        +ticket.ticket_number

        +" ثبت شد"

    );









    if(profile.role==="admin"){

        location.href="../admin/admin-tickets.html";

    }

    else{

        location.href="my-tickets.html";

    }



}







window.sendTicket=sendTicket;