$(document).ready(function () {
    $("#loginForm").on("submit", function (event) {
        event.preventDefault();
        var formData = new FormData($("#loginForm")[0]);
        // Ensure CSRF token is included explicitly (in addition to ajaxSetup header)
        try {
            var csrf = $('meta[name="csrf-token"]').attr('content');
            if (csrf && !formData.has('_token')) {
                formData.append('_token', csrf);
            }
        } catch (e) { /* no-op */ }
        $.ajax({
            url: `/loginForm`,
            type: "POST",
            data: formData,
            dataType: "json",
            contentType: false,
            cache: false,
            processData: false,
            headers: (function(){
                var h = {};
                try { var t = $('meta[name="csrf-token"]').attr('content'); if (t) h['X-CSRF-TOKEN'] = t; } catch(e) {}
                return h;
            })(),
            success: function (response) {
                console.log(response);
                if (response && (response.status === true || response.status === 'true')) {
                    window.location.assign('/dashboard');
                } else {
                    $.NotificationApp.send(
                        "Oops",
                        (response && response.message) ? response.message : "Wrong credentials!",
                        "top-right",
                        "rgba(0,0,0,0.2)",
                        "error",
                        3000
                    );
                }
            },
            error: function (err) {
                console.log(err);
            },
        });
    });

    $("#forgotPasswordForm").on("submit", function (event) {
        event.preventDefault();
        var formData = new FormData(this);
        // Ensure CSRF token is included explicitly
        try {
            var csrf = $('meta[name="csrf-token"]').attr('content');
            if (csrf && !formData.has('_token')) {
                formData.append('_token', csrf);
            }
        } catch (e) { /* no-op */ }

        var newPassword = $("#new_password").val();
        var confirmPassword = $("#confirm_password").val();

        if (newPassword !== confirmPassword) {
            showErrorToast("Passwords do not match!");
            return;
        }

        $.ajax({
            url: `/forgotPasswordForm`,
            type: "POST",
            data: formData,
            dataType: "json",
            contentType: false,
            processData: false,
            headers: (function(){
                var h = {};
                try { var t = $('meta[name="csrf-token"]').attr('content'); if (t) h['X-CSRF-TOKEN'] = t; } catch(e) {}
                return h;
            })(),
            success: function (response) {
                if (response.status) {
                    $("#forgotPasswordModal").modal("hide");
                    resetForm("#forgotPasswordForm");
                    resetForm("#loginForm");
                    showSuccessToast(response.message);
                } else {
                    showErrorToast(response.message);
                }
            },
            error: function (err) {
                console.log(err);
            },
        });
    });
});
