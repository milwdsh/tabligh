checkAccess("advertiser");


loadSidebar();


document.getElementById("header").innerHTML=.  await header("کیف پول");



loadWallet();



async function loadWallet(){


const {data:{session}}=await supabaseClient.auth.getSession();



const {data:wallet,error}=await supabaseClient

.from("wallets")

.select("*")

.eq("user_id",session.user.id)

.single();



if(wallet){


document.getElementById("balance").innerText=

formatPrice(wallet.balance)+" تومان";


}else{


document.getElementById("balance").innerText=

"0 تومان";


}



loadTransactions(session.user.id);


}





async function loadTransactions(userId){


const {data,error}=await supabaseClient

.from("transactions")

.select("*")

.eq("user_id",userId)

.order("created_at",{ascending:false});



const box=document.getElementById("transactions");


if(!data || data.length===0){


box.innerHTML="تراکنشی وجود ندارد";


return;


}



box.innerHTML="";



data.forEach(item=>{


box.innerHTML+=`

<div class="cardBox">


<p>

${item.description || "تراکنش"}

</p>


<p>

مبلغ:

${formatPrice(item.amount)}

تومان

</p>


</div>


`;

});


}



document.getElementById("withdraw").onclick=function(){


toast("درخواست تسویه ثبت شد");

}