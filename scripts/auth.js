// ========================================
// E-Commerce Frontend — Auth JS
// Firebase Authentication Integration
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ========================================
    // 1. FIREBASE INITIALIZATION
    // ========================================

    // Initialize Firebase App
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    // Set session persistence (keeps user logged in across refreshes)
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

    // ========================================
    // 2. NAVIGATION (shared)
    // ========================================
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("active");
            hamburger.setAttribute("aria-expanded", isOpen);
            hamburger.querySelector(".hamburger__icon").innerHTML = isOpen ? '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-close"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
        });

        document.addEventListener("click", (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove("active");
                hamburger.setAttribute("aria-expanded", "false");
                hamburger.querySelector(".hamburger__icon").innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
            }
        });
    }

    // Initialize cart badge
    if (typeof Cart !== "undefined") {
        Cart.updateCartCount();
    }

    // ========================================
    // 3. VALIDATION UTILITIES
    // ========================================

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validateEmail(email) {
        if (!email.trim()) return "Email is required.";
        if (!EMAIL_REGEX.test(email)) return "Please enter a valid email address.";
        return "";
    }

    function validatePassword(password) {
        if (!password) return "Password is required.";
        if (password.length < 8) return "Password must be at least 8 characters.";
        return "";
    }

    function validatePasswordStrength(password) {
        return {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
        };
    }

    function isStrongPassword(password) {
        const s = validatePasswordStrength(password);
        return s.length && s.upper && s.lower && s.number;
    }

    function validateName(name) {
        if (!name.trim()) return "Full name is required.";
        if (name.trim().length < 2) return "Name must be at least 2 characters.";
        return "";
    }

    function showFieldError(errorEl, message) {
        if (!errorEl) return;
        errorEl.textContent = message;
        errorEl.style.display = message ? "block" : "none";
    }

    function showGlobalMessage(el, message, type) {
        if (!el) return;
        el.textContent = message;
        el.className = `auth-form__message auth-form__message--${type}`;
        el.style.display = message ? "block" : "none";
    }

    function setupPasswordToggle(toggleBtn, inputEl) {
        if (!toggleBtn || !inputEl) return;
        toggleBtn.addEventListener("click", () => {
            const isPassword = inputEl.type === "password";
            inputEl.type = isPassword ? "text" : "password";
            toggleBtn.textContent = isPassword ? "🙈" : "👁️";
        });
    }

    // ---- Firebase Error Messages ----
    function getFirebaseErrorMessage(errorCode) {
        const errorMessages = {
            "auth/email-already-in-use": "An account with this email already exists.",
            "auth/invalid-email": "Please enter a valid email address.",
            "auth/user-disabled": "This account has been disabled.",
            "auth/user-not-found": "No account found with this email.",
            "auth/wrong-password": "Incorrect password. Please try again.",
            "auth/weak-password": "Password is too weak. Use at least 8 characters.",
            "auth/too-many-requests": "Too many failed attempts. Please try again later.",
            "auth/network-request-failed": "Network error. Please check your connection.",
            "auth/invalid-credential": "Invalid credentials. Please check your email and password.",
            "auth/operation-not-allowed": "Email/Password sign-in is not enabled.",
        };
        return errorMessages[errorCode] || "An unexpected error occurred. Please try again.";
    }

    // ========================================
    // 4. LOGIN FORM
    // ========================================

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        const emailInput = document.getElementById("loginEmail");
        const passwordInput = document.getElementById("loginPassword");
        const emailError = document.getElementById("loginEmailError");
        const passwordError = document.getElementById("loginPasswordError");
        const globalError = document.getElementById("loginGlobalError");
        const togglePw = document.getElementById("toggleLoginPw");
        const loginBtn = document.getElementById("loginBtn");

        setupPasswordToggle(togglePw, passwordInput);

        // Real-time validation
        emailInput.addEventListener("input", () => {
            showFieldError(emailError, validateEmail(emailInput.value));
        });

        passwordInput.addEventListener("input", () => {
            showFieldError(passwordError, passwordInput.value ? "" : "Password is required.");
        });

        // Submit — Firebase signInWithEmailAndPassword
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Client-side validation
            const emailErr = validateEmail(email);
            const pwErr = password ? "" : "Password is required.";

            showFieldError(emailError, emailErr);
            showFieldError(passwordError, pwErr);
            if (emailErr || pwErr) return;

            // Disable button during request
            loginBtn.textContent = "Logging in...";
            loginBtn.disabled = true;

            try {
                // Firebase Authentication
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;

                console.log("✅ Logged in:", user.email);

                // Store minimal user info in localStorage for UI access
                localStorage.setItem("currentUser", JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || "",
                }));

                // Visual feedback
                showGlobalMessage(globalError, "", "error");
                loginBtn.textContent = "✓ Success! Redirecting...";
                loginBtn.style.background = "linear-gradient(135deg, #00b894, #00cec9)";

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);

            } catch (error) {
                console.error("❌ Login error:", error.code, error.message);
                showGlobalMessage(globalError, getFirebaseErrorMessage(error.code), "error");
                loginBtn.textContent = "Log In";
                loginBtn.disabled = false;
            }
        });
    }

    // ========================================
    // 5. SIGNUP FORM
    // ========================================

    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        const nameInput = document.getElementById("signupName");
        const emailInput = document.getElementById("signupEmail");
        const passwordInput = document.getElementById("signupPassword");
        const confirmInput = document.getElementById("signupConfirm");

        const nameError = document.getElementById("signupNameError");
        const emailError = document.getElementById("signupEmailError");
        const passwordError = document.getElementById("signupPasswordError");
        const confirmError = document.getElementById("signupConfirmError");
        const globalError = document.getElementById("signupGlobalError");
        const globalSuccess = document.getElementById("signupGlobalSuccess");

        const togglePw = document.getElementById("toggleSignupPw");
        const toggleConfirm = document.getElementById("toggleSignupConfirm");
        const signupBtn = document.getElementById("signupBtn");

        const ruleLength = document.getElementById("ruleLength");
        const ruleUpper = document.getElementById("ruleUpper");
        const ruleLower = document.getElementById("ruleLower");
        const ruleNumber = document.getElementById("ruleNumber");

        setupPasswordToggle(togglePw, passwordInput);
        setupPasswordToggle(toggleConfirm, confirmInput);

        function updatePasswordRules() {
            const strength = validatePasswordStrength(passwordInput.value);
            updateRule(ruleLength, strength.length);
            updateRule(ruleUpper, strength.upper);
            updateRule(ruleLower, strength.lower);
            updateRule(ruleNumber, strength.number);
        }

        function updateRule(ruleEl, passed) {
            if (!ruleEl) return;
            const icon = ruleEl.querySelector(".pw-rule__icon");
            if (passed) {
                ruleEl.classList.add("pw-rule--pass");
                ruleEl.classList.remove("pw-rule--fail");
                icon.textContent = "✓";
            } else {
                ruleEl.classList.remove("pw-rule--pass");
                ruleEl.classList.add("pw-rule--fail");
                icon.textContent = "○";
            }
        }

        // Real-time validation
        nameInput.addEventListener("input", () => {
            showFieldError(nameError, validateName(nameInput.value));
        });

        emailInput.addEventListener("input", () => {
            showFieldError(emailError, validateEmail(emailInput.value));
        });

        passwordInput.addEventListener("input", () => {
            updatePasswordRules();
            if (passwordInput.value && !isStrongPassword(passwordInput.value)) {
                showFieldError(passwordError, "Password does not meet all requirements.");
            } else {
                showFieldError(passwordError, "");
            }
            if (confirmInput.value && confirmInput.value !== passwordInput.value) {
                showFieldError(confirmError, "Passwords do not match.");
            } else if (confirmInput.value) {
                showFieldError(confirmError, "");
            }
        });

        confirmInput.addEventListener("input", () => {
            if (confirmInput.value !== passwordInput.value) {
                showFieldError(confirmError, "Passwords do not match.");
            } else {
                showFieldError(confirmError, "");
            }
        });

        // Submit — Firebase createUserWithEmailAndPassword
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirm = confirmInput.value;

            // Client-side validation
            const nameErr = validateName(name);
            const emailErr = validateEmail(email);
            let pwErr = validatePassword(password);
            if (!pwErr && !isStrongPassword(password)) {
                pwErr = "Password does not meet all requirements.";
            }
            const confirmErr = confirm !== password ? "Passwords do not match." : "";

            showFieldError(nameError, nameErr);
            showFieldError(emailError, emailErr);
            showFieldError(passwordError, pwErr);
            showFieldError(confirmError, confirmErr);

            if (nameErr || emailErr || pwErr || confirmErr) return;

            // Disable button during request
            signupBtn.textContent = "Creating account...";
            signupBtn.disabled = true;

            try {
                // Firebase Create User
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Update display name in Firebase
                await user.updateProfile({
                    displayName: name,
                });

                console.log("✅ Account created:", user.email);

                // Sign out so user can log in fresh
                await auth.signOut();

                // Success feedback
                showGlobalMessage(globalError, "", "error");
                showGlobalMessage(globalSuccess, "Account created successfully! Redirecting to login...", "success");

                signupBtn.textContent = "✓ Account Created!";
                signupBtn.style.background = "linear-gradient(135deg, #00b894, #00cec9)";

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);

            } catch (error) {
                console.error("❌ Signup error:", error.code, error.message);
                showGlobalMessage(globalError, getFirebaseErrorMessage(error.code), "error");
                showGlobalMessage(globalSuccess, "", "success");
                signupBtn.textContent = "Create Account";
                signupBtn.disabled = false;
            }
        });
    }

    // ========================================
    // 6. AUTH STATE OBSERVER
    // ========================================

    auth.onAuthStateChanged((user) => {
        updateNavForAuth(user);

        if (user) {
            console.log("🔑 Auth state: Logged in as", user.email);
            localStorage.setItem("currentUser", JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || "",
            }));
        } else {
            console.log("🔑 Auth state: Not logged in");
            localStorage.removeItem("currentUser");
        }
    });

    // ========================================
    // 7. UPDATE NAV FOR AUTH STATE
    // ========================================

    function updateNavForAuth(user) {
        const authNavItem = document.getElementById("authNavItem");
        if (!authNavItem) return;

        if (user) {
            const displayName = user.displayName || user.email.split("@")[0];
            authNavItem.innerHTML = `
                <span class="nav__user-greeting">Hi, ${displayName}</span>
                <button class="nav__logout-btn" id="logoutBtn" aria-label="Log out">Logout</button>
            `;

            const logoutBtn = document.getElementById("logoutBtn");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", async () => {
                    try {
                        await auth.signOut();
                        localStorage.removeItem("currentUser");
                        console.log("✅ Logged out successfully");
                        window.location.href = "login.html";
                    } catch (error) {
                        console.error("❌ Logout error:", error);
                    }
                });
            }
        } else {
            authNavItem.innerHTML = `<a href="login.html" class="nav__link">Login</a>`;
        }
    }
});
