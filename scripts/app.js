// ========================================
// E-Commerce Frontend — App JS
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("E-Commerce Website Loaded");

    // ========================================
    // NAVIGATION
    // ========================================
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll(".nav__link");

    // ---- Toggle Mobile Menu ----
    hamburger.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("active");
        hamburger.setAttribute("aria-expanded", isOpen);
        hamburger.querySelector(".hamburger__icon").textContent = isOpen ? "✕" : "☰";
    });

    // ---- Close Menu on Link Click ----
    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
            hamburger.querySelector(".hamburger__icon").textContent = "☰";

            navLinks.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
        });
    });

    // ---- Close Menu on Outside Click ----
    document.addEventListener("click", (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
            hamburger.querySelector(".hamburger__icon").textContent = "☰";
        }
    });

    // ========================================
    // PRODUCT GRID — Fetch & Render
    // ========================================
    const productGrid = document.getElementById("productGrid");
    const productLoader = document.getElementById("productLoader");
    const productError = document.getElementById("productError");
    const retryBtn = document.getElementById("retryBtn");

    // ---- Generate Star Rating ----
    function generateStars(rate) {
        const fullStars = Math.floor(rate);
        const halfStar = rate % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        return "★".repeat(fullStars) + (halfStar ? "½" : "") + "☆".repeat(emptyStars);
    }

    // ---- Create Product Card ----
    function createProductCard(product, index) {
        const card = document.createElement("div");
        card.classList.add("product-card");
        card.style.animationDelay = `${index * 0.08}s`;

        card.innerHTML = `
            <div class="product-card__image-wrapper">
                <span class="product-card__category">${product.category}</span>
                <img
                    class="product-card__image"
                    src="${product.image}"
                    alt="${product.title}"
                    loading="lazy"
                >
            </div>
            <div class="product-card__body">
                <h3 class="product-card__title">${product.title}</h3>
                <div class="product-card__rating">
                    <span class="product-card__stars">${generateStars(product.rating.rate)}</span>
                    <span>(${product.rating.count})</span>
                </div>
                <div class="product-card__footer">
                    <span class="product-card__price">$${product.price.toFixed(2)}</span>
                    <button class="product-card__add-btn" aria-label="Add ${product.title} to cart">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    // ---- Fetch Products ----
    async function fetchProducts() {
        // Show loader, hide error & grid
        productLoader.style.display = "";
        productError.style.display = "none";
        productGrid.innerHTML = "";

        try {
            const response = await fetch("https://fakestoreapi.com/products");

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const products = await response.json();

            // Hide loader
            productLoader.style.display = "none";

            // Render product cards
            products.forEach((product, index) => {
                const card = createProductCard(product, index);
                productGrid.appendChild(card);
            });

            console.log(`✅ Loaded ${products.length} products`);
        } catch (error) {
            console.error("❌ Failed to fetch products:", error);

            // Hide loader, show error
            productLoader.style.display = "none";
            productError.style.display = "";
        }
    }

    // ---- Retry Button ----
    retryBtn.addEventListener("click", fetchProducts);

    // ---- Add to Cart Handler (Event Delegation) ----
    productGrid.addEventListener("click", (e) => {
        const btn = e.target.closest(".product-card__add-btn");
        if (!btn) return;

        const card = btn.closest(".product-card");
        const title = card.querySelector(".product-card__title").textContent;

        // Visual feedback
        const originalText = btn.textContent;
        btn.textContent = "✓ Added!";
        btn.style.background = "linear-gradient(135deg, #00b894, #00cec9)";

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = "";
        }, 1500);

        console.log(`🛒 Added to cart: ${title}`);
    });

    // ---- Initial Fetch ----
    fetchProducts();
});
