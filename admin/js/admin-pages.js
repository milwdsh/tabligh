document.addEventListener("DOMContentLoaded", () => {

    startAdminPages();

});



async function startAdminPages(){


const {data:{session}} = await supabaseClient.auth.getSession();



if(!session){

alert("ابتدا وارد شوید");

window.location.href = ROUTES.login;

return;

}



const {data:profile,error} = await supabaseClient

.from("profiles")

.select("role")

.eq("id",session.user.id)

.single();



if(error || !profile || profile.role !== "admin"){

alert("دسترسی ندارید");

window.location.href = ROUTES.dashboard;

return;

}



loadSidebar("admin");


document.getElementById("header").innerHTML =

await header("بررسی پیج‌ها");



loadPendingPages();


}







async function loadPendingPages(){



const {data,error}=await supabaseClient

.from("advertiser_pages")

.select("*")

.eq("status","pending")

.order("created_at",{ascending:false});



const box=document.getElementById("pagesContainer");



if(!box) return;



box.innerHTML="";



if(error){


box.innerHTML=`

<div class="cardBox">

<h3>خطا در دریافت اطلاعات</h3>

<p>${error.message}</p>

</div>

`;

return;

}



if(!data || data.length===0){


box.innerHTML=`

<div class="cardBox">

<h2>پیجی برای بررسی وجود ندارد</h2>

</div>

`;

return;

}





data.forEach(page=>{


box.innerHTML += `


<div class="cardBox pageCard">


<h2>${page.page_name}</h2>


<p>
آیدی اینستاگرام:
${page.instagram_id}
</p>


<p>
دسته:
${page.category || "-"}
</p>


<p>
فالوور:
${page.followers || 0}
</p>


<p>
وضعیت:
${page.status}
</p>



<div class="actions">


<button class="btn"

onclick="changePageStatus('${page.id}','approved')">

تایید پیج

</button>



<button class="btn danger"

onclick="changePageStatus('${page.id}','rejected')">

رد پیج

</button>


</div>


</div>


`;

});


}








async function changePageStatus(id,status){



const {error}=await supabaseClient

.from("advertiser_pages")

.update({

status:status

})

.eq("id",id);



if(error){

alert(error.message);

return;

}



alert("وضعیت پیج تغییر کرد");


loadPendingPages();


}