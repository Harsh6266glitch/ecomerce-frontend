// ========================================
// E-Commerce Frontend — Product Detail JS
// Advanced Interactive Features
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

    function addToCart(item) {
        const cart = getCart();
        const key = `${item.id}-${item.size}-${item.color}`;
        const existing = cart.find(
            (c) => c.id === item.id && c.size === item.size && c.color === item.color
        );

        if (existing) {
            existing.quantity += item.quantity;
        } else {
            cart.push({ ...item, key });
        }

        saveCart(cart);
        updateCartBadge();
    }

    function getCartCount() {
        return getCart().reduce((sum, item) => sum + item.quantity, 0);
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
    // 3. IMAGE ZOOM — Mouse-Tracking
    // ========================================

    const imageWrapper = document.getElementById("imageZoomWrapper");
    const detailImage = document.getElementById("detailImage");

    function isMobile() {
        return window.innerWidth <= 768;
    }

    if (imageWrapper && detailImage) {
        // Track mouse position for zoom origin
        imageWrapper.addEventListener("mousemove", (e) => {
            if (isMobile()) return;

            const rect = imageWrapper.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            detailImage.style.transformOrigin = `${x}% ${y}%`;
        });

        // Reset on leave
        imageWrapper.addEventListener("mouseleave", () => {
            detailImage.style.transformOrigin = "center center";
        });
    }

    // ========================================
    // 4. VARIATION SELECTORS
    // ========================================

    let selectedSize = "S";
    let selectedColor = "Black";

    // ---- Size Variation ----
    const sizeButtons = document.querySelectorAll(
        "#variationSize .variation__btn--size"
    );

    sizeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            if (btn.disabled) return;

            sizeButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            selectedSize = btn.dataset.value;

            console.log(`📏 Size selected: ${selectedSize}`);
        });
    });

    // ---- Color Variation ----
    const colorButtons = document.querySelectorAll(
        "#variationColor .variation__btn--color"
    );

    colorButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            if (btn.disabled) return;

            colorButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            selectedColor = btn.dataset.value;

            console.log(`🎨 Color selected: ${selectedColor}`);
        });
    });

    // ========================================
    // 5. QUANTITY SELECTOR
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

        // Disable buttons at limits
        qtyMinus.disabled = quantity <= MIN_QTY;
        qtyMinus.style.opacity = quantity <= MIN_QTY ? "0.35" : "1";
        qtyPlus.disabled = quantity >= MAX_QTY;
        qtyPlus.style.opacity = quantity >= MAX_QTY ? "0.35" : "1";
    }

    function updateTotalPrice() {
        const total = (basePrice * quantity).toFixed(2);
        totalPriceEl.textContent = `$${total}`;

        // Price bump animation
        totalPriceEl.classList.remove("price-bump");
        void totalPriceEl.offsetWidth; // Trigger reflow
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
    // 6. PRODUCT DETAIL — Fetch & Render
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

    // ---- Store current product data ----
    let currentProduct = null;

    function renderProduct(product) {
        currentProduct = product;
        basePrice = product.price;

        // Page title
        document.title = `${product.title} — E-Shop`;

        // Breadcrumb
        breadcrumbTitle.textContent = product.title;

        // Image
        detailImage.src = product.image;
        detailImage.alt = product.title;

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

        // Initialize quantity & total
        quantity = 1;
        updateQuantityDisplay();
        updateTotalPrice();

        // ---- Add to Cart Button ----
        const addBtn = document.getElementById("detailAddBtn");
        const confirmation = document.getElementById("detailConfirmation");

        addBtn.addEventListener("click", () => {
            // Build cart item with variations
            const cartItem = {
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                size: selectedSize,
                color: selectedColor,
                quantity: quantity,
                totalPrice: parseFloat((product.price * quantity).toFixed(2)),
            };

            addToCart(cartItem);

            // Visual feedback
            addBtn.textContent = "✓ Added to Cart!";
            addBtn.classList.add("detail__add-btn--added");
            addBtn.disabled = true;

            confirmation.style.display = "flex";
            confirmation.style.gap = "8px";
            confirmation.style.alignItems = "center";

            console.log("🛒 Added to cart:", cartItem);

            setTimeout(() => {
                addBtn.textContent = "🛒 Add to Cart";
                addBtn.classList.remove("detail__add-btn--added");
                addBtn.disabled = false;
                confirmation.style.display = "none";
            }, 2500);
        });

        showContent();
    }

    // ---- Fetch Single Product ----
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

    // ========================================
    // 7. INITIALIZE
    // ========================================
    updateCartBadge();
    fetchProduct();
});
