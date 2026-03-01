// ========================================
// E-Commerce Frontend — Product Detail JS
// Uses shared Cart module from cart.js
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
    // 2. IMAGE ZOOM — Mouse-Tracking
    // ========================================

    const imageWrapper = document.getElementById("imageZoomWrapper");
    const detailImage = document.getElementById("detailImage");

    function isMobile() {
        return window.innerWidth <= 768;
    }

    if (imageWrapper && detailImage) {
        imageWrapper.addEventListener("mousemove", (e) => {
            if (isMobile()) return;
            const rect = imageWrapper.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            detailImage.style.transformOrigin = `${x}% ${y}%`;
        });

        imageWrapper.addEventListener("mouseleave", () => {
            detailImage.style.transformOrigin = "center center";
        });
    }

    // ========================================
    // 3. VARIATION SELECTORS
    // ========================================

    let selectedSize = "S";
    let selectedColor = "Black";

    const sizeButtons = document.querySelectorAll("#variationSize .variation__btn--size");
    sizeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            if (btn.disabled) return;
            sizeButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            selectedSize = btn.dataset.value;
            console.log(`📏 Size: ${selectedSize}`);
        });
    });

    const colorButtons = document.querySelectorAll("#variationColor .variation__btn--color");
    colorButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            if (btn.disabled) return;
            colorButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            selectedColor = btn.dataset.value;
            console.log(`🎨 Color: ${selectedColor}`);
        });
    });

    // ========================================
    // 4. QUANTITY SELECTOR
    // ========================================

    const MIN_QTY = 1;
    const MAX_QTY = 10;
    let quantity = 1;
    let basePrice = 0;

    const qtyMinus = document.getElementById("qtyMinus");
    const qtyPlus = document.getElementById("qtyPlus");
    const qtyValue = document.getElementById("qtyValue");
    const totalPriceEl = document.getElementById("detailTotalPrice");

    function updateQuantityDisplay() {
        qtyValue.textContent = quantity;
        qtyMinus.disabled = quantity <= MIN_QTY;
        qtyMinus.style.opacity = quantity <= MIN_QTY ? "0.35" : "1";
        qtyPlus.disabled = quantity >= MAX_QTY;
        qtyPlus.style.opacity = quantity >= MAX_QTY ? "0.35" : "1";
    }

    function updateTotalPrice() {
        const total = (basePrice * quantity).toFixed(2);
        totalPriceEl.textContent = `$${total}`;
        totalPriceEl.classList.remove("price-bump");
        void totalPriceEl.offsetWidth;
        totalPriceEl.classList.add("price-bump");
    }

    qtyMinus.addEventListener("click", () => {
        if (quantity > MIN_QTY) {
            quantity--;
            updateQuantityDisplay();
            updateTotalPrice();
        }
    });

    qtyPlus.addEventListener("click", () => {
        if (quantity < MAX_QTY) {
            quantity++;
            updateQuantityDisplay();
            updateTotalPrice();
        }
    });

    // ========================================
    // 5. PRODUCT DETAIL — Fetch & Render
    // ========================================

    const API_BASE = "https://fakestoreapi.com/products";
    const detailLoader = document.getElementById("detailLoader");
    const detailError = document.getElementById("detailError");
    const detailContent = document.getElementById("detailContent");
    const breadcrumbTitle = document.getElementById("breadcrumbTitle");

    function getProductIdFromURL() {
        return new URLSearchParams(window.location.search).get("id");
    }

    function generateStars(rate) {
        const full = Math.floor(rate);
        const half = rate % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
    }

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

    let currentProduct = null;

    function renderProduct(product) {
        currentProduct = product;
        basePrice = product.price;

        document.title = `${product.title} — E-Shop`;
        breadcrumbTitle.textContent = product.title;

        detailImage.src = product.image;
        detailImage.alt = product.title;

        document.getElementById("detailCategory").textContent = product.category;
        document.getElementById("detailTitle").textContent = product.title;

        const ratingEl = document.getElementById("detailRating");
        ratingEl.querySelector(".detail__stars").textContent = generateStars(product.rating.rate);
        ratingEl.querySelector(".detail__rating-count").textContent =
            `${product.rating.rate.toFixed(1)} / 5  ·  ${product.rating.count} reviews`;

        document.getElementById("detailPrice").textContent = `$${product.price.toFixed(2)}`;
        document.getElementById("detailDescription").textContent = product.description;

        quantity = 1;
        updateQuantityDisplay();
        updateTotalPrice();

        // ---- Add to Cart (uses shared Cart module) ----
        const addBtn = document.getElementById("detailAddBtn");
        const confirmation = document.getElementById("detailConfirmation");

        addBtn.addEventListener("click", () => {
            const cartItem = {
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                size: selectedSize,
                color: selectedColor,
                quantity: quantity,
            };

            Cart.addToCart(cartItem);
            Cart.showAddedFeedback(addBtn, confirmation);

            console.log("🛒 Added to cart:", cartItem);
        });

        showContent();
    }

    async function fetchProduct() {
        const productId = getProductIdFromURL();

        if (!productId) {
            showError();
            console.error("❌ No product ID in URL.");
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
            console.log(`✅ Loaded: ${product.title}`);

        } catch (error) {
            console.error("❌ Fetch failed:", error.message);
            showError();
        }
    }

    // ========================================
    // 6. INITIALIZE
    // ========================================
    Cart.updateCartCount();
    fetchProduct();
});
