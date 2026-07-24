document.addEventListener("DOMContentLoaded",()=>{

    startProfile();

});





async function startProfile(){


const {data:{session}} =
await supabaseClient.auth.getSession();



if(!session){

window.location.href = ROUTES.login;

return;

}



const {data:profile,error:roleError}=

await supabaseClient

.from("profiles")

.select("role")

.eq("id",session.user.id)

.single();



if(roleError || profile.role !== "advertiser"){

alert("دسترسی ندارید");

window.location.href = ROUTES.dashboard;

return;

}




loadSidebar("advertiser");



document.getElementById("header").innerHTML =

  await header("اطلاعات پیج");




loadPageInfo();



}







async function loadPageInfo(){



const {data:{session}} =
await supabaseClient.auth.getSession();




const {data,error}=

await supabaseClient

.from("advertiser_pages")

.select("*")

.eq("user_id",session.user.id)

.single();




if(error){


document.getElementById("pageName").innerText =
"پیجی ثبت نشده";


return;

}





document.getElementById("pageName").innerText =
data.page_name;



document.getElementById("pageBio").innerText =
data.bio || "";



document.getElementById("instagram").innerText =
data.instagram_id || "-";



document.getElementById("followers").innerText =
data.followers || 0;



document.getElementById("storyViews").innerText =
data.story_views || 0;



document.getElementById("reelViews").innerText =
data.reel_views || 0;



document.getElementById("storyPrice").innerText =
formatPrice(data.story_price || 0);



document.getElementById("postPrice").innerText =
formatPrice(data.post_price || 0);



document.getElementById("reelPrice").innerText =
formatPrice(data.reel_price || 0);



}