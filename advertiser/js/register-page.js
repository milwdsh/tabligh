document.addEventListener("DOMContentLoaded", () => {

    loadRegisterPage();

});



async function loadRegisterPage(){


    const {data:{session}} =
    await supabaseClient.auth.getSession();



    if(!session){

        window.location.href = "login.html";

        return;

    }




    const {data:profile,error} =

    await supabaseClient

    .from("profiles")

    .select("role")

    .eq("id",session.user.id)

    .single();




    if(error || !profile || profile.role !== "advertiser"){


        alert("فقط صاحب پیج می‌تواند پیج ثبت کند");

        window.location.href = "../dashboard.html";

        return;

    }




    loadSidebar("advertiser");


    document.getElementById("header").innerHTML =
    await header("ثبت پیج تبلیغاتی");



    const btn = document.getElementById("savePage");


    if(btn){

        btn.onclick = savePage;

    }


}








async function savePage(){



    const {data:{session}} =
    await supabaseClient.auth.getSession();



    if(!session){

        alert("ابتدا وارد حساب شوید");

        return;

    }





    const pageName =
    document.getElementById("pageName").value.trim();



    const instagramId =
    document.getElementById("instagramId").value.trim();





    if(!pageName || !instagramId){


        alert("نام پیج و آیدی اینستاگرام الزامی است");

        return;

    }







    const pageData = {


        user_id: session.user.id,


        page_name: pageName,


        instagram_id: instagramId,


        category:
        document.getElementById("category").value.trim(),



        followers:
        Number(document.getElementById("followers").value || 0),



        story_views:
        Number(document.getElementById("storyViews").value || 0),



        reel_views:
        Number(document.getElementById("reelViews").value || 0),



        story_price:
        Number(document.getElementById("storyPrice").value || 0),



        post_price:
        Number(document.getElementById("postPrice").value || 0),



        reel_price:
        Number(document.getElementById("reelPrice").value || 0),



        bio:
        document.getElementById("bio").value.trim(),



        status:"pending"

    };






    const {data,error} = await supabaseClient

    .from("advertiser_pages")

    .insert(pageData)

    .select();





    if(error){


        console.log(error);


        alert(error.message);


        return;

    }





    console.log("ثبت شد:",data);



    alert("پیج با موفقیت برای بررسی ارسال شد");




    setTimeout(()=>{


        window.location.href = "advertiser.html";


    },1500);



}