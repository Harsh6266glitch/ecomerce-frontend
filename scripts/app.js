// ========================================
// E-Commerce Frontend — App JS
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("E-Commerce Website Loaded");

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
            navLinks.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
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
    // 2. PRODUCT GRID — Fetch & Render
    // ========================================

    const API_URL = "https://fakestoreapi.com/products";
    const productGrid = document.getElementById("productGrid");
    const productLoader = document.getElementById("productLoader");
    const productError = document.getElementById("productError");
    const retryBtn = document.getElementById("retryBtn");

    // ---- Utility: Truncate Text ----
    function truncateText(text, maxLength = 80) {
        if (!text) return "";
        return text.length > maxLength
            ? text.substring(0, maxLength).trim() + "…"
            : text;
    }

    // ---- Utility: Generate Star Rating ----
    function generateStars(rate) {
        const full = Math.floor(rate);
        const half = rate % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
    }

    // ---- Create a Single Product Card (using document.createElement) ----
    function createProductCard(product, index) {

        // Card wrapper
        const card = document.createElement("div");
        card.classList.add("product-card");
        card.style.animationDelay = `${index * 0.07}s`;

        // --- Image Wrapper ---
        const imageWrapper = document.createElement("div");
        imageWrapper.classList.add("product-card__image-wrapper");

        // Category badge
        const categoryBadge = document.createElement("span");
        categoryBadge.classList.add("product-card__category");
        categoryBadge.textContent = product.category;

        // Product image
        const image = document.createElement("img");
        image.classList.add("product-card__image");
        image.src = product.image;
        image.alt = product.title;
        image.loading = "lazy";           // Lazy loading for performance
        image.decoding = "async";

        imageWrapper.appendChild(categoryBadge);
        imageWrapper.appendChild(image);

        // --- Card Body ---
        const body = document.createElement("div");
        body.classList.add("product-card__body");

        // Title
        const title = document.createElement("h3");
        title.classList.add("product-card__title");
        title.textContent = product.title;

        // Description (truncated)
        const description = document.createElement("p");
        description.classList.add("product-card__description");
        description.textContent = truncateText(product.description, 80);

        // Rating
        const rating = document.createElement("div");
        rating.classList.add("product-card__rating");

        const stars = document.createElement("span");
        stars.classList.add("product-card__stars");
        stars.textContent = generateStars(product.rating.rate);

        const ratingCount = document.createElement("span");
        ratingCount.textContent = `(${product.rating.count})`;

        rating.appendChild(stars);
        rating.appendChild(ratingCount);

        // Footer (Price + Add to Cart)
        const footer = document.createElement("div");
        footer.classList.add("product-card__footer");

        const price = document.createElement("span");
        price.classList.add("product-card__price");
        price.textContent = `$${product.price.toFixed(2)}`;

        const addBtn = document.createElement("button");
        addBtn.classList.add("product-card__add-btn");
        addBtn.textContent = "Add to Cart";
        addBtn.setAttribute("aria-label", `Add ${product.title} to cart`);

        footer.appendChild(price);
        footer.appendChild(addBtn);

        // Assemble body
        body.appendChild(title);
        body.appendChild(description);
        body.appendChild(rating);
        body.appendChild(footer);

        // Assemble card
        card.appendChild(imageWrapper);
        card.appendChild(body);

        return card;
    }

    // ---- Show Loading State ----
    function showLoading() {
        // Show skeleton loader
        if (productLoader) productLoader.style.display = "";

        // Also show loading text inside the grid
        productGrid.innerHTML = "";
        const loadingMsg = document.createElement("p");
        loadingMsg.classList.add("product-grid__loading-text");
        loadingMsg.textContent = "Loading products...";
        productGrid.appendChild(loadingMsg);

        // Hide error
        if (productError) productError.style.display = "none";
    }

    // ---- Show Error State ----
    function showError() {
        if (productLoader) productLoader.style.display = "none";
        productGrid.innerHTML = "";
        if (productError) productError.style.display = "";
    }

    // ---- Async Fetch Products ----
    async function fetchProducts() {
        showLoading();

        try {
            const response = await fetch(API_URL);

            // Handle HTTP errors
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }

            const products = await response.json();

            // Hide loader & clear loading text
            if (productLoader) productLoader.style.display = "none";
            productGrid.innerHTML = "";

            // Validate response
            if (!Array.isArray(products) || products.length === 0) {
                throw new Error("No products returned from API.");
            }

            // Render each product card
            products.forEach((product, index) => {
                const card = createProductCard(product, index);
                productGrid.appendChild(card);
            });

            console.log(`✅ Successfully loaded ${products.length} products`);

        } catch (error) {
            console.error("❌ Failed to fetch products:", error.message);
            showError();
        }
    }

    // ---- Retry Button ----
    if (retryBtn) {
        retryBtn.addEventListener("click", fetchProducts);
    }

    // ---- Add to Cart — Event Delegation ----
    productGrid.addEventListener("click", (e) => {
        const btn = e.target.closest(".product-card__add-btn");
        if (!btn) return;

        const card = btn.closest(".product-card");
        const productTitle = card.querySelector(".product-card__title").textContent;

        // Visual feedback
        const originalText = btn.textContent;
        btn.textContent = "✓ Added!";
        btn.style.background = "linear-gradient(135deg, #00b894, #00cec9)";
        btn.disabled = true;

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = "";
            btn.disabled = false;
        }, 1500);

        console.log(`🛒 Added to cart: ${productTitle}`);
    });

    // ---- Initial Load ----
    fetchProducts();
});
