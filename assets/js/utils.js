function formatPrice(number){

return new Intl.NumberFormat("fa-IR").format(number);

}

function formatDate(date){

return new Date(date).toLocaleDateString("fa-IR");

}

function loading(button,text){

button.disabled=true;

button.innerText=text;

}

function stopLoading(button,text){

button.disabled=false;

button.innerText=text;

}


function orderStatusText(status){

    switch(status){

        case "pending":
            return "⏳ در انتظار بررسی";

        case "accepted":
            return "✅ تایید شده";

        case "rejected":
            return "❌ رد شده";

        case "completed":
            return "🏁 تکمیل شده";

        default:
            return status || "-";

    }

}


function paymentStatusText(status){

    switch(status){

        case "paid":
            return "✅ پرداخت شده";

        case "unpaid":
            return "❌ پرداخت نشده";

        case "pending":
            return "⏳ در انتظار پرداخت";

        default:
            return status || "-";

    }

}