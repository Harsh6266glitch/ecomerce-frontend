// ========================================
// E-Commerce Frontend — App JS (index.html)
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
        const badge = document.querySelector(".cart__badge");
        if (badge) {
            const count = getCartCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? "flex" : "none";
        }
    }

    // ========================================
    // 3. PRODUCT GRID — Fetch & Render
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

    // ---- Create a Single Product Card ----
    function createProductCard(product, index) {

        // Card wrapper — clickable link to product detail
        const card = document.createElement("div");
        card.classList.add("product-card");
        card.style.animationDelay = `${index * 0.07}s`;
        card.dataset.productId = product.id;

        // --- Image Wrapper (clickable) ---
        const imageLink = document.createElement("a");
        imageLink.href = `product.html?id=${product.id}`;
        imageLink.classList.add("product-card__image-wrapper");

        const categoryBadge = document.createElement("span");
        categoryBadge.classList.add("product-card__category");
        categoryBadge.textContent = product.category;

        const image = document.createElement("img");
        image.classList.add("product-card__image");
        image.src = product.image;
        image.alt = product.title;
        image.loading = "lazy";
        image.decoding = "async";

        imageLink.appendChild(categoryBadge);
        imageLink.appendChild(image);

        // --- Card Body ---
        const body = document.createElement("div");
        body.classList.add("product-card__body");

        // Title (clickable)
        const titleLink = document.createElement("a");
        titleLink.href = `product.html?id=${product.id}`;
        titleLink.classList.add("product-card__title-link");

        const title = document.createElement("h3");
        title.classList.add("product-card__title");
        title.textContent = product.title;
        titleLink.appendChild(title);

        // Description
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

        // Footer
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
        body.appendChild(titleLink);
        body.appendChild(description);
        body.appendChild(rating);
        body.appendChild(footer);

        // Assemble card
        card.appendChild(imageLink);
        card.appendChild(body);

        return card;
    }

    // ---- Show Loading State ----
    function showLoading() {
        if (productLoader) productLoader.style.display = "";
        productGrid.innerHTML = "";
        const loadingMsg = document.createElement("p");
        loadingMsg.classList.add("product-grid__loading-text");
        loadingMsg.textContent = "Loading products...";
        productGrid.appendChild(loadingMsg);
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

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }

            const products = await response.json();

            if (productLoader) productLoader.style.display = "none";
            productGrid.innerHTML = "";

            if (!Array.isArray(products) || products.length === 0) {
                throw new Error("No products returned from API.");
            }

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

        // Prevent card click navigation
        e.preventDefault();
        e.stopPropagation();

        const card = btn.closest(".product-card");
        const productId = parseInt(card.dataset.productId);
        const productTitle = card.querySelector(".product-card__title").textContent;
        const productPrice = parseFloat(
            card.querySelector(".product-card__price").textContent.replace("$", "")
        );
        const productImage = card.querySelector(".product-card__image").src;

        // Add to localStorage cart
        addToCart({
            id: productId,
            title: productTitle,
            price: productPrice,
            image: productImage,
        });

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

    // ---- Initialize ----
    updateCartBadge();
    fetchProducts();
});
