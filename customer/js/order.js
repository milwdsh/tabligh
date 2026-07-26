document.addEventListener("DOMContentLoaded",()=>{

    startOrder();

});



let currentPage = null;



async function startOrder(){


    const {data:{session}} =
    await supabaseClient.auth.getSession();



    if(!session){

        location.href="../login.html";

        return;

    }




    const {data:profile} =

    await supabaseClient

    .from("profiles")

    .select("role")

    .eq("id",session.user.id)

    .single();




    if(profile){

        loadSidebar(profile.role);

    }




    document.getElementById("header").innerHTML =

    await header("ثبت سفارش");





    const params =

    new URLSearchParams(window.location.search);



    const pageId =

    params.get("page");




    if(!pageId){


        alert("پیج تبلیغاتی انتخاب نشده است");


        history.back();


        return;

    }




    await loadPageInfo(pageId);




    document

    .getElementById("service")

    .addEventListener("change",updatePrice);



}







async function loadPageInfo(pageId){



    const {data,error} =

    await supabaseClient

    .from("advertiser_pages")

    .select("*")

    .eq("id",pageId)

    .eq("status","approved")

    .single();




    if(error || !data){



        alert("پیج تبلیغاتی پیدا نشد");


        history.back();


        return;


    }





    currentPage = data;




    document.getElementById("pageInfoBox").innerHTML = `


    <h3>

    📢 پیج تبلیغاتی انتخاب شده

    </h3>



    <p>

    نام پیج:

    <b>

    ${data.page_name}

    </b>

    </p>




    <p>

    آیدی اینستاگرام:

    <b>

    ${data.instagram_id}

    </b>

    </p>




    <p>

    دنبال کننده:

    <b>

    ${data.followers || 0}

    </b>

    </p>




    <hr>




    <p>

    📱 استوری:

    <b>

    ${formatPrice(data.story_price || 0)}

    </b>

    تومان

    </p>




    <p>

    🖼 پست:

    <b>

    ${formatPrice(data.post_price || 0)}

    </b>

    تومان

    </p>




    <p>

    🎬 ریلز:

    <b>

    ${formatPrice(data.reel_price || 0)}

    </b>

    تومان

    </p>



    `;




    updatePrice();


}







function updatePrice(){



    if(!currentPage){

        return;

    }




    let price = 0;




    const service =

    document.getElementById("service").value;




    switch(service){



        case "story":

            price =
            currentPage.story_price || 0;

            break;




        case "post":

            price =
            currentPage.post_price || 0;

            break;




        case "reel":

            price =
            currentPage.reel_price || 0;

            break;



    }





    document.getElementById("priceBox").innerHTML = `


    <b>

    ${formatPrice(price)}

    </b>

    تومان



    `;



}

async function submitOrder(){



    const {data:{session}} =

    await supabaseClient.auth.getSession();




    if(!session){


        alert("ابتدا وارد حساب شوید");


        return;


    }




    if(!currentPage){


        alert("پیج تبلیغاتی انتخاب نشده است");


        return;


    }







    const instagramId =

    document

    .getElementById("customerInstagram")

    .value

    .trim();





    const pageLink =

    document

    .getElementById("customerLink")

    .value

    .trim();






    const followers =

    Number(

    document

    .getElementById("customerFollowers")

    .value || 0

    );





    const phone =

    document

    .getElementById("customerPhone")

    .value

    .trim();






    const service =

    document

    .getElementById("service")

    .value;






    const publishDate =

    document

    .getElementById("publishDate")

    .value

    .trim();






    const publishTime =

    document

    .getElementById("publishTime")

    .value;






    const note =

    document

    .getElementById("customerNote")

    .value

    .trim();








    if(!instagramId){


        toast("آیدی پیج خود را وارد کنید","error");


        return;


    }






    if(!phone){


        toast("شماره تماس را وارد کنید","error");


        return;


    }






    if(!publishDate){


        toast("تاریخ انتشار را وارد کنید","error");


        return;


    }






    if(!publishTime){


        toast("ساعت انتشار را وارد کنید","error");


        return;


    }






    let price = 0;





    switch(service){



        case "story":


            price = currentPage.story_price || 0;


            break;



        case "post":


            price = currentPage.post_price || 0;


            break;



        case "reel":


            price = currentPage.reel_price || 0;


            break;



    }







    const {data,error} =

    await supabaseClient

    .from("orders")

    .insert({



        customer_id:

        session.user.id,



        advertiser_page_id:

        currentPage.id,



        service_type:

        service,



        price:

        price,



        publish_date:

        publishDate,



        publish_time:

        publishTime,



        customer_instagram_id:

        instagramId,



        customer_page_link:

        pageLink,



        customer_followers:

        followers,



        customer_phone:

        phone,



        customer_note:

        note,



        status:

        "pending_payment",



        payment_status:

        "unpaid"



    })

    .select()

    .single();







    if(error){


        console.log(error);


        toast(error.message,"error");


        return;


    }







    localStorage.setItem(

        "orderId",

        data.id

    );







    location.href="payment.html";



}