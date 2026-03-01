// ========================================
// E-Commerce Frontend — Product Detail JS
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("Product Detail Page Loaded");

    // ========================================
    // 1. NAVIGATION — Mobile Menu Toggle
    // ========================================
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll(".nav__link");

    hamburger.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("active");
        hamburger.setAttribute("aria-expanded", isOpen);
        hamburger.querySelector(".hamburger__icon").textContent = isOpen ? "✕" : "☰";
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
            hamburger.querySelector(".hamburger__icon").textContent = "☰";
        });
    });

    document.addEventListener("click", (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
            hamburger.querySelector(".hamburger__icon").textContent = "☰";
        }
    });

    // ========================================
    // 2. CART — LocalStorage Helpers
    // ========================================

    function getCart() {
        try {
            const cart = JSON.parse(localStorage.getItem("eshop_cart"));
            return Array.isArray(cart) ? cart : [];
        } catch {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem("eshop_cart", JSON.stringify(cart));
    }

    function addToCart(product) {
        const cart = getCart();
        const existing = cart.find((item) => item.id === product.id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: 1,
            });
        }

        saveCart(cart);
        updateCartBadge();
    }

    function getCartCount() {
        const cart = getCart();
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    function updateCartBadge() {
        const badge = document.getElementById("cartBadge");
        if (badge) {
            const count = getCartCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? "flex" : "none";
        }
    }

    // ========================================
    // 3. PRODUCT DETAIL — Fetch & Render
    // ========================================

    const API_BASE = "https://fakestoreapi.com/products";

    const detailLoader = document.getElementById("detailLoader");
    const detailError = document.getElementById("detailError");
    const detailContent = document.getElementById("detailContent");
    const breadcrumbTitle = document.getElementById("breadcrumbTitle");

    // ---- Get Product ID from URL ----
    function getProductIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get("id");
    }

    // ---- Generate Stars ----
    function generateStars(rate) {
        const full = Math.floor(rate);
        const half = rate % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
    }

    // ---- Show States ----
    function showLoading() {
        detailLoader.style.display = "";
        detailError.style.display = "none";
        detailContent.style.display = "none";
    }

    function showError() {
        detailLoader.style.display = "none";
        detailError.style.display = "";
        detailContent.style.display = "none";
    }

    function showContent() {
        detailLoader.style.display = "none";
        detailError.style.display = "none";
        detailContent.style.display = "";
    }

    // ---- Render Product ----
    function renderProduct(product) {
        // Update page title
        document.title = `${product.title} — E-Shop`;

        // Breadcrumb
        breadcrumbTitle.textContent = product.title;

        // Image
        const image = document.getElementById("detailImage");
        image.src = product.image;
        image.alt = product.title;

        // Category
        document.getElementById("detailCategory").textContent = product.category;

        // Title
        document.getElementById("detailTitle").textContent = product.title;

        // Rating
        const ratingEl = document.getElementById("detailRating");
        ratingEl.querySelector(".detail__stars").textContent = generateStars(product.rating.rate);
        ratingEl.querySelector(".detail__rating-count").textContent =
            `${product.rating.rate.toFixed(1)} / 5  ·  ${product.rating.count} reviews`;

        // Price
        document.getElementById("detailPrice").textContent = `$${product.price.toFixed(2)}`;

        // Description
        document.getElementById("detailDescription").textContent = product.description;

        // Add to Cart button
        const addBtn = document.getElementById("detailAddBtn");
        const confirmation = document.getElementById("detailConfirmation");

        addBtn.addEventListener("click", () => {
            addToCart(product);

            // Visual feedback
            addBtn.textContent = "✓ Added to Cart!";
            addBtn.classList.add("detail__add-btn--added");
            confirmation.style.display = "block";

            setTimeout(() => {
                addBtn.textContent = "🛒 Add to Cart";
                addBtn.classList.remove("detail__add-btn--added");
                confirmation.style.display = "none";
            }, 2000);
        });

        showContent();
    }

    // ---- Fetch Product ----
    async function fetchProduct() {
        const productId = getProductIdFromURL();

        if (!productId) {
            showError();
            console.error("❌ No product ID found in URL.");
            return;
        }

        showLoading();

        try {
            const response = await fetch(`${API_BASE}/${productId}`);

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }

            const product = await response.json();

            if (!product || !product.id) {
                throw new Error("Invalid product data received.");
            }

            renderProduct(product);
            console.log(`✅ Loaded product: ${product.title}`);

        } catch (error) {
            console.error("❌ Failed to fetch product:", error.message);
            showError();
        }
    }

    // ---- Initialize ----
    updateCartBadge();
    fetchProduct();
});
