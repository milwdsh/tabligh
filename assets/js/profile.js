document.addEventListener("DOMContentLoaded", () => {
    startProfile();
});

async function startProfile() {

    await header("پروفایل");

    const { data: { session } } =
    await supabaseClient.auth.getSession();

    if (!session) {

        window.location.href = ROUTES.login;
        return;

    }

    const { data: profile } =
    await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

    if (!profile) {

        alert("اطلاعات کاربر پیدا نشد.");
        return;

    }

    loadSidebar(profile.role);

    loadProfile();

    document
    .getElementById("saveBtn")
    .addEventListener("click", saveProfile);

    document
    .getElementById("passwordBtn")
    .addEventListener("click", changePassword);

}

async function loadProfile() {

    const { data: { user } } =
    await supabaseClient.auth.getUser();

    const { data, error } =
    await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

    if (error) {

        alert(error.message);
        return;

    }

    document.getElementById("name").value =
    data.name || "";

    document.getElementById("email").value =
    data.email || "";

    document.getElementById("phone").value =
    data.phone || "";

    document.getElementById("role").value =
    getRoleName(data.role);

    document.getElementById("createdAt").value =
    new Date(data.created_at).toLocaleDateString("fa-IR");

}

async function saveProfile() {

    const name =
    document.getElementById("name").value.trim();

    const email =
    document.getElementById("email").value.trim();

    const phone =
    document.getElementById("phone").value.trim();

    const { data: { user } } =
    await supabaseClient.auth.getUser();

    const { error } =
    await supabaseClient
    .from("profiles")
    .update({

        name,
        email,
        phone

    })
    .eq("id", user.id);

    if (error) {

        alert(error.message);
        return;

    }

    const { error: authError } =
    await supabaseClient.auth.updateUser({

        email

    });

    if (authError) {

        alert(authError.message);
        return;

    }

    alert("اطلاعات با موفقیت ذخیره شد.");

}

async function changePassword() {

    const password =
    document.getElementById("password").value;

    const password2 =
    document.getElementById("password2").value;

    if (password.length < 6) {

        alert("رمز عبور باید حداقل ۶ کاراکتر باشد.");
        return;

    }

    if (password !== password2) {

        alert("تکرار رمز عبور صحیح نیست.");
        return;

    }

    const { error } =
    await supabaseClient.auth.updateUser({

        password

    });

    if (error) {

        alert(error.message);
        return;

    }

    document.getElementById("password").value = "";
    document.getElementById("password2").value = "";

    alert("رمز عبور با موفقیت تغییر کرد.");

}

function getRoleName(role) {

    switch (role) {

        case "admin":
            return "مدیر";

        case "advertiser":
            return "صاحب پیج تبلیغاتی";

        case "customer":
            return "مشتری";

        default:
            return role || "-";

    }

}