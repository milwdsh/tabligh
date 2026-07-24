loadSidebar();

document.getElementById("header").innerHTML=. await header("انتخاب پیج تبلیغاتی");


loadPages();



async function loadPages(){


const {data,error}=await supabaseClient

.from("advertiser_pages")

.select("*")

.eq("status","approved");



if(error){

toast("خطا در دریافت پیج‌ها","error");

return;

}



const box=document.getElementById("pagesContainer");

box.innerHTML="";



data.forEach(page=>{


box.innerHTML+=`

<div class="cardBox">


<h2>${page.page_name}</h2>


<p>

${page.instagram_id}

</p>


<p>

دنبال کننده:

${page.followers}

</p>


<p>

استوری:

${formatPrice(page.story_price)}

تومان

</p>


<button class="btn"

onclick="choosePage('${page.id}')">

انتخاب پیج

</button>


</div>


`;

});


}



function choosePage(id){


localStorage.setItem("selectedPage",id);


window.location.href="order.html";


}