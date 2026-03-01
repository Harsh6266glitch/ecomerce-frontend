// ========================================
// E-Commerce Frontend — Auth JS
// Login & Signup with localStorage
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ========================================
    // 1. NAVIGATION (shared)
    // ========================================
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("active");
            hamburger.setAttribute("aria-expanded", isOpen);
            hamburger.querySelector(".hamburger__icon").textContent = isOpen ? "✕" : "☰";
        });

        document.addEventListener("click", (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove("active");
                hamburger.setAttribute("aria-expanded", "false");
                hamburger.querySelector(".hamburger__icon").textContent = "☰";
            }
        });
    }

    // Initialize cart badge
    if (typeof Cart !== "undefined") {
        Cart.updateCartCount();
    }

    // ========================================
    // 2. VALIDATION UTILITIES
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

    // ---- Show / Clear Error ----
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

    // ---- Password Toggle ----
    function setupPasswordToggle(toggleBtn, inputEl) {
        if (!toggleBtn || !inputEl) return;
        toggleBtn.addEventListener("click", () => {
            const isPassword = inputEl.type === "password";
            inputEl.type = isPassword ? "text" : "password";
            toggleBtn.textContent = isPassword ? "🙈" : "👁️";
        });
    }

    // ========================================
    // 3. USER STORAGE HELPERS
    // ========================================

    function getUsers() {
        try {
            const users = JSON.parse(localStorage.getItem("users"));
            return Array.isArray(users) ? users : [];
        } catch {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }

    function findUserByEmail(email) {
        return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
    }

    function setCurrentUser(user) {
        const safeUser = {
            name: user.name,
            email: user.email,
            joinedAt: user.joinedAt || new Date().toISOString(),
        };
        localStorage.setItem("currentUser", JSON.stringify(safeUser));
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

        // Password toggle
        setupPasswordToggle(togglePw, passwordInput);

        // Real-time validation
        emailInput.addEventListener("input", () => {
            showFieldError(emailError, validateEmail(emailInput.value));
        });

        passwordInput.addEventListener("input", () => {
            showFieldError(passwordError, passwordInput.value ? "" : "Password is required.");
        });

        // Submit
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Validate
            const emailErr = validateEmail(email);
            const pwErr = password ? "" : "Password is required.";

            showFieldError(emailError, emailErr);
            showFieldError(passwordError, pwErr);

            if (emailErr || pwErr) return;

            // Check credentials
            const user = findUserByEmail(email);

            if (!user) {
                showGlobalMessage(globalError, "No account found with this email.", "error");
                return;
            }

            if (user.password !== password) {
                showGlobalMessage(globalError, "Incorrect password. Please try again.", "error");
                return;
            }

            // Success
            showGlobalMessage(globalError, "", "error");
            setCurrentUser(user);

            // Show success then redirect
            const btn = document.getElementById("loginBtn");
            btn.textContent = "✓ Success! Redirecting...";
            btn.disabled = true;
            btn.style.background = "linear-gradient(135deg, #00b894, #00cec9)";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
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

        // Password strength rule elements
        const ruleLength = document.getElementById("ruleLength");
        const ruleUpper = document.getElementById("ruleUpper");
        const ruleLower = document.getElementById("ruleLower");
        const ruleNumber = document.getElementById("ruleNumber");

        // Password toggles
        setupPasswordToggle(togglePw, passwordInput);
        setupPasswordToggle(toggleConfirm, confirmInput);

        // ---- Update Strength Rules UI ----
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

        // ---- Real-time Validation ----
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

            // Re-validate confirm match
            if (confirmInput.value) {
                if (confirmInput.value !== passwordInput.value) {
                    showFieldError(confirmError, "Passwords do not match.");
                } else {
                    showFieldError(confirmError, "");
                }
            }
        });

        confirmInput.addEventListener("input", () => {
            if (confirmInput.value !== passwordInput.value) {
                showFieldError(confirmError, "Passwords do not match.");
            } else {
                showFieldError(confirmError, "");
            }
        });

        // ---- Submit ----
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirm = confirmInput.value;

            // Validate all fields
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

            // Check duplicate email
            if (findUserByEmail(email)) {
                showGlobalMessage(globalError, "An account with this email already exists.", "error");
                return;
            }

            // Save new user
            const users = getUsers();
            const newUser = {
                name,
                email: email.toLowerCase(),
                password,
                joinedAt: new Date().toISOString(),
            };
            users.push(newUser);
            saveUsers(users);

            // Success
            showGlobalMessage(globalError, "", "error");
            showGlobalMessage(globalSuccess, "Account created successfully! Redirecting to login...", "success");

            const btn = document.getElementById("signupBtn");
            btn.textContent = "✓ Account Created!";
            btn.disabled = true;
            btn.style.background = "linear-gradient(135deg, #00b894, #00cec9)";

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        });
    }
});
