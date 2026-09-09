document.addEventListener("DOMContentLoaded", () => {
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");


// Handle Login 
if (loginForm) { 
    loginForm.addEventListener("submit", async (e) => { 
        e.preventDefault(); // Prevents page reload 
         
        const email = document.getElementById("login-email").value; 
        const password = document.getElementById("login-password").value; 

        // Simple validation check 
        if (email && password) { 

            try {

                const formData = new URLSearchParams();

                formData.append("username", email);
                formData.append("password", password);

                const response = await fetch(
                    "https://harmoniq-backend-ceb8.onrender.com/user/login", 
                    { 
                        method: "POST", 
                        headers: { 
                            "Content-Type": "application/x-www-form-urlencoded" 
                        }, 
                        body: formData 
                    } 
                ); 

                if (!response.ok) { 

                    const errorData = 
                        await response.json().catch(() => ({})); 

                    throw new Error( 
                        errorData.detail || 
                        "Invalid email or password." 
                    ); 

                } 

                const data = await response.json(); 

                // Store JWT access token 
                localStorage.setItem( 
                    "access_token", 
                    data.access_token 
                ); 

                // Redirect to main page 
                window.location.href = "index.html"; 

            } catch (error) { 

                console.error( 
                    "Login error:", 
                    error 
                ); 

                alert( 
                    error.message || 
                    "Login failed. Please try again." 
                ); 

            } 
        }  
    });  
}  

// Handle Signup  
if (signupForm) {  
    signupForm.addEventListener("submit", async (e) => {  
        e.preventDefault(); // Prevents page reload  

        const email = document.getElementById("signup-email").value;  
        const password = document.getElementById("signup-password").value;  
        const confirmPassword = document.getElementById("confirm-password").value;  

        // Validate matching passwords  
        if (password !== confirmPassword) {  
            alert("Passwords do not match! Please check again.");  
            return;  
        }  

        if (email && password) {  

            try {

                const response = await fetch(
                    "https://harmoniq-backend-ceb8.onrender.com/user/signup",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );

                if (!response.ok) {

                    const errorData =
                        await response.json().catch(() => ({}));

                    throw new Error(
                        errorData.detail ||
                        "Signup failed. Please try again."
                    );

                }

                const data = await response.json();

                console.log(
                    "Signup successful:",
                    data
                );

                alert(
                    "Account created successfully! Please login."
                );

                // Redirect to login page
                window.location.href = "login.html";

            } catch (error) {

                console.error(
                    "Signup error:",
                    error
                );

                alert(
                    error.message ||
                    "Signup failed. Please try again."
                );

            }

        }  
    });  
}  


});
