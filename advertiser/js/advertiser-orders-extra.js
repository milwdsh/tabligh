function statusText(status){


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