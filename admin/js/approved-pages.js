document.addEventListener("DOMContentLoaded",()=>{

    loadApprovedPages();

});





async function loadApprovedPages(){


const {data:{session}} =
await supabaseClient.auth.getSession();



if(!session){

window.location.href="../login.html";

return;

}





const {data:profile,error:profileError}=await supabaseClient

.from("profiles")

.select("role")

.eq("id",session.user.id)

.single();





if(profileError || !profile || profile.role!=="admin"){

alert("دسترسی ندارید");

return;

}





loadSidebar("admin");


document.getElementById("header").innerHTML =
   await header("پیج‌های تایید شده");





const {data:pages,error}=await supabaseClient

.from("advertiser_pages")

.select("*")

.eq("status","approved")

.order("created_at",{ascending:false});





const box=document.getElementById("pagesContainer");


box.innerHTML="";





if(error){

console.log(error);

box.innerHTML=`

<div class="cardBox">

خطا در دریافت اطلاعات

</div>

`;

return;

}





if(!pages || pages.length===0){

box.innerHTML=`

<div class="cardBox">

<h2>
پیج تایید شده‌ای وجود ندارد
</h2>

</div>

`;

return;

}





for(const page of pages){



const {data:owner}=await supabaseClient

.from("profiles")

.select("name,email")

.eq("id",page.user_id)

.single();





box.innerHTML+=`

<div class="cardBox">


<h2>

${page.page_name || "-"}

</h2>



<p>
📷 آیدی اینستاگرام:

${page.instagram_id || "-"}

</p>



<p>
👤 صاحب پیج:

${owner?.name || "-"}

</p>



<p>
📧 ایمیل:

${owner?.email || "-"}

</p>



<p>
📂 دسته بندی:

${page.category || "-"}

</p>



<p>
👥 فالوور:

${page.followers || 0}

</p>



<p>
👁 بازدید استوری:

${page.story_views || 0}

</p>



<p>
🎬 بازدید ریلز:

${page.reel_views || 0}

</p>



<hr>



<p>
استوری:

${formatPrice(page.story_price || 0)}

تومان

</p>



<p>
پست:

${formatPrice(page.post_price || 0)}

تومان

</p>



<p>
ریلز:

${formatPrice(page.reel_price || 0)}

تومان

</p>



<p>
📝 توضیحات:

${page.bio || "-"}

</p>




<button

class="btn"

onclick="disablePage('${page.id}')">

⛔ غیرفعال کردن پیج

</button>



</div>

`;

}



}









async function disablePage(id){



const ok = confirm(
"این پیج غیرفعال شود؟"
);



if(!ok){

return;

}





const {error}=await supabaseClient

.from("advertiser_pages")

.update({

status:"disabled"

})

.eq("id",id);





if(error){

console.log(error);

toast("غیرفعال کردن انجام نشد","error");

return;

}





toast("پیج غیرفعال شد");


setTimeout(()=>{

loadApprovedPages();

},500);



}





window.disablePage = disablePage;