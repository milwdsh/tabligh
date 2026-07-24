let pageId = null;



document.addEventListener("DOMContentLoaded",()=>{

startEditPage();

});





async function startEditPage(){


const {data:{session}} =
await supabaseClient.auth.getSession();



if(!session){

window.location.href = ROUTES.login;

return;

}



const {data:profile,error}=

await supabaseClient

.from("profiles")

.select("role")

.eq("id",session.user.id)

.single();



if(error || !profile || profile.role !== "advertiser"){

alert("دسترسی ندارید");

window.location.href = ROUTES.dashboard;

return;

}



loadSidebar("advertiser");



document.getElementById("header").innerHTML =

  await header("ویرایش اطلاعات پیج");



loadPageData();


}





async function loadPageData(){



const {data:{session}} =
await supabaseClient.auth.getSession();



const {data,error}=

await supabaseClient

.from("advertiser_pages")

.select("*")

.eq("user_id",session.user.id)

.single();



if(error){

alert("پیجی برای ویرایش پیدا نشد");

window.location.href = ROUTES.advertiserDashboard;

return;

}



pageId=data.id;



[
"page_name",
"instagram_id",
"category",
"followers",
"story_views",
"reel_views",
"story_price",
"post_price",
"reel_price",
"bio",
"profile_image"

].forEach(id=>{

document.getElementById(id).value =
data[id] || "";

});



if(data.profile_image){

document.getElementById("preview").src =
data.profile_image;

}



document
.getElementById("profile_image")
.addEventListener("input",function(){

document.getElementById("preview").src=this.value;

});


}







async function savePage(){



const fields=[

"page_name",
"instagram_id",
"category",
"followers",
"story_views",
"reel_views",
"story_price",
"post_price",
"reel_price",
"bio",
"profile_image"

];



let updateData={};



fields.forEach(field=>{

updateData[field]=
document.getElementById(field).value;

});



if(!updateData.page_name){

alert("نام پیج را وارد کنید");

return;

}



if(!updateData.instagram_id){

alert("آیدی اینستاگرام را وارد کنید");

return;

}




const {error}=await supabaseClient

.from("advertiser_pages")

.update(updateData)

.eq("id",pageId);




if(error){

alert(error.message);

return;

}



alert("اطلاعات پیج ذخیره شد");


window.location.href =
ROUTES.advertiserDashboard;


}





function goBack(){


window.location.href =
ROUTES.advertiserDashboard;


}