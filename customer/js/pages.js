document.addEventListener("DOMContentLoaded", async () => {

    loadSidebar();

    document.getElementById("header").innerHTML =
        await header("پیج‌های تبلیغاتی");

    loadPages();

});


async function loadPages(){


const box=document.getElementById("pagesContainer");



const {data,error}=await supabaseClient

.from("advertiser_pages")

.select("*")

.eq("status","approved")

.order("created_at",{ascending:false});



if(error){

console.log(error);


box.innerHTML=`

<div class="cardBox">

خطا در دریافت پیج‌ها

</div>

`;

return;

}



box.innerHTML="";



if(!data || data.length===0){


box.innerHTML=`

<div class="cardBox">

<h2>

پیج تبلیغاتی موجود نیست

</h2>

</div>

`;

return;

}



data.forEach(page=>{


box.innerHTML+=`

<div class="cardBox">


${page.profile_image ? 

`<img src="${page.profile_image}" width="80">`

:

""

}



<h2>

${page.page_name || "بدون نام"}

</h2>



<p>

اینستاگرام:

${page.instagram_id || "-"}

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

بازدید استوری:

${page.story_views || 0}

</p>



<p>

بازدید ریلز:

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



<button class="btn"

onclick="choosePage('${page.id}')">

ثبت سفارش

</button>



</div>

`;

});


}





function choosePage(id){


localStorage.setItem(

"selectedPage",

id

);



location.href="order.html";


}
