let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {

    startWallet();

});

async function startWallet() {

    const { data: { session } } =
        await supabaseClient.auth.getSession();

    if (!session) {

        location.href = ROUTES.login;

        return;

    }

    currentUser = session.user;

    loadSidebar("advertiser");

    document.getElementById("header").innerHTML =
        await header("کیف پول");

    await loadWallet();

    await loadTransactions();

}

async function loadWallet() {

    const { data: wallet, error } =
        await supabaseClient

            .from("wallets")

            .select("balance")

            .eq("user_id", currentUser.id)

            .maybeSingle();

    if (error) {

        console.log(error);

        return;

    }

    document.getElementById("walletBalance").innerHTML = `

        💰 موجودی کیف پول

        <br><br>

        <span style="font-size:28px;font-weight:bold">

        ${formatPrice(wallet?.balance || 0)}

        تومان

        </span>

    `;

}

async function submitWithdraw() {

    const amount =
        Number(document.getElementById("withdrawAmount").value);

    const cardName =
        document.getElementById("cardName").value.trim();

    const cardNumber =
        document.getElementById("cardNumber").value.trim();

    if (!amount || !cardName || !cardNumber) {

        alert("تمام اطلاعات را وارد کنید.");

        return;

    }

    const { data: wallet } =
        await supabaseClient

            .from("wallets")

            .select("balance")

            .eq("user_id", currentUser.id)

            .maybeSingle();

    if (!wallet || amount > wallet.balance) {

        alert("موجودی کافی نیست.");

        return;

    }

    const { error: requestError } =
        await supabaseClient

            .from("withdrawal_requests")

            .insert({

                user_id: currentUser.id,

                amount,

                card_name: cardName,

                card_number: cardNumber,

                status: "pending"

            });

    if (requestError) {

        alert(requestError.message);

        return;

    }

    await supabaseClient

        .from("transactions")

        .insert({

            user_id: currentUser.id,

            amount: amount,

            type: "withdrawal_request",

            status: "pending",

            description: `درخواست تسویه ${formatPrice(amount)} تومان`

        });

    alert("درخواست تسویه ثبت شد.");

    document.getElementById("withdrawAmount").value = "";

    document.getElementById("cardName").value = "";

    document.getElementById("cardNumber").value = "";

    loadTransactions();

}

async function loadTransactions(){

    const box = document.getElementById("transactionsBox");

    const {data,error} = await supabaseClient
        .from("transactions")
        .select("*")
        .eq("user_id",currentUser.id)
        .order("created_at",{ascending:false});

    if(error){

        console.log(error);

        box.innerHTML=`
        <div class="cardBox">
            خطا در دریافت تراکنش‌ها
        </div>
        `;

        return;
    }

    if(!data || data.length===0){

        box.innerHTML=`
        <div class="cardBox">
            هنوز تراکنشی ثبت نشده است.
        </div>
        `;

        return;
    }

    let html=`

    <div class="tableResponsive">

    <table class="table">

        <thead>

            <tr>

                <th>نوع</th>

                <th>مبلغ</th>

                <th>وضعیت</th>

                <th>توضیح</th>

                <th>تاریخ</th>

            </tr>

        </thead>

        <tbody>

    `;

    data.forEach(t=>{

        html+=`

        <tr>

            <td>${transactionType(t.type)}</td>

            <td>
                <strong>
                    ${formatPrice(t.amount)} تومان
                </strong>
            </td>

            <td>${transactionStatus(t.status)}</td>

            <td>${t.description || "-"}</td>

            <td>${new Date(t.created_at).toLocaleDateString("fa-IR")}</td>

        </tr>

        `;

    });

    html+=`

        </tbody>

    </table>

    </div>

    `;

    box.innerHTML=html;

}

function transactionType(type){

    switch(type){

        case "advertiser_income":
            return "💰 درآمد تبلیغ";

        case "withdrawal_request":
            return "⏳ درخواست تسویه";

        case "withdrawal_paid":
            return "💸 تسویه انجام شد";

        case "withdrawal_rejected":
            return "❌ رد درخواست تسویه";

        case "refund":
            return "↩️ برگشت وجه";

        case "admin_income":
            return "🏦 کارمزد سایت";

        default:
            return type || "-";

    }

}


function transactionStatus(status){

    switch(status){

        case "pending":
            return "<span style='color:#f39c12'>⏳ در انتظار</span>";

        case "completed":
            return "<span style='color:#27ae60'>✅ انجام شده</span>";

        case "rejected":
            return "<span style='color:#e74c3c'>❌ رد شده</span>";

        default:
            return "-";

    }

}


window.submitWithdraw = submitWithdraw;