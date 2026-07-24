   const form = document.getElementById("loginForm");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Redirect to home page
        window.location.href = "./home.html";
    });
