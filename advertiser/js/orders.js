document.addEventListener("DOMContentLoaded", () => {
    startOrders();
});

async function startOrders() {

    const { data: { session } } =
        await supabaseClient.auth.getSession();

    if (!session) {
        location.href = ROUTES.login;
        return;
    }

    loadSidebar("advertiser");

    document.getElementById("header").innerHTML =
        await header("سفارش‌های تبلیغ");

    loadOrders(session.user.id);

}

async function loadOrders(userId) {

    const container =
        document.getElementById("ordersContainer");

    // گرفتن پیج‌های این صاحب پیج
    const { data: pages, error: pageError } =
        await supabaseClient
            .from("advertiser_pages")
            .select("id,page_name,instagram_id")
            .eq("user_id", userId);

    if (pageError) {
        container.innerHTML = `
        <div class="cardBox">
        خطا در دریافت پیج‌ها
        </div>`;
        return;
    }

    if (!pages || pages.length === 0) {
        container.innerHTML = `
        <div class="cardBox">
        هنوز هیچ پیجی ثبت نکرده‌اید.
        </div>`;
        return;
    }

    const pageIds = pages.map(p => p.id);

    // سفارش‌های مربوط به همین پیج‌ها
    const {data:orders,error}=await supabaseClient
.from("orders")
.select("*")
.in("advertiser_page_id",pageIds)
.in("status",[
    "waiting_advertiser",
    "advertiser_accepted",
    "waiting_admin_check",
    "completed",
    "rejected"
])
.order("created_at",{ascending:false});

    if (error) {
        container.innerHTML = `
        <div class="cardBox">
        خطا در دریافت سفارش‌ها
        </div>`;
        console.log(error);
        return;
    }

    if (!orders || orders.length === 0) {
        container.innerHTML = `
        <div class="cardBox">
        هنوز سفارشی برای شما ثبت نشده است.
        </div>`;
        return;
    }

    container.innerHTML = "";

    orders.forEach(order => {

        const page =
            pages.find(p => p.id === order.advertiser_page_id);

        container.innerHTML += `

        <div class="cardBox">

            <h2>

            سفارش #${order.id.substring(0,8)}

            </h2>

            <p>

            📄 پیج:

            <b>${page?.page_name || "-"}</b>

            </p>

            <p>

            📷 آیدی:

            ${page?.instagram_id || "-"}

            </p>

            <p>

            🎯 نوع تبلیغ:

            ${serviceText(order.service_type)}

            </p>

            <p>

            💰 مبلغ:

            ${formatPrice(order.price)}

            تومان

            </p>

            <p>

            📅 تاریخ:

            ${order.publish_date || "-"}

            </p>

            <p>

            📌 وضعیت:

            ${statusText(order.status)}

            </p>

            <button
                class="btn"
                onclick="location.href='order-details.html?id=${order.id}'">

                مشاهده سفارش

            </button>

        </div>

        `;

    });

}

function serviceText(type) {

    if (type === "story") return "استوری";

    if (type === "post") return "پست";

    if (type === "reel") return "ریلز";

    return type;

}

function statusText(status) {

    switch (status) {

        case "waiting_advertiser":
            return "🟡 منتظر قبول شما";

        case "advertiser_accepted":
            return "🟢 در حال انجام تبلیغ";

        case "waiting_admin_check":
            return "🟠 منتظر تایید ادمین";

        case "completed":
            return "✅ تکمیل شده";

        case "rejected":
            return "❌ رد شده";

        default:
            return status || "-";
    }

}