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
        hamburger.querySelector(".hamburger__icon").innerHTML = isOpen ? '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-close"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
            hamburger.querySelector(".hamburger__icon").innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
        });
    });

    document.addEventListener("click", (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
            hamburger.querySelector(".hamburger__icon").innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
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

        // Optimized WebP via Proxy
        detailImage.dataset.src = `https://images.weserv.nl/?url=${encodeURIComponent(product.image)}&output=webp&w=800`;
        detailImage.dataset.srcset = `
            https://images.weserv.nl/?url=${encodeURIComponent(product.image)}&output=webp&w=400 400w,
            https://images.weserv.nl/?url=${encodeURIComponent(product.image)}&output=webp&w=800 800w,
            https://images.weserv.nl/?url=${encodeURIComponent(product.image)}&output=webp&w=1200 1200w
        `;
        detailImage.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E`;
        detailImage.width = 800;
        detailImage.height = 800;

        // Native intersection fallback logic
        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.srcset = img.dataset.srcset;
                        obs.unobserve(img);
                    }
                });
            });
            observer.observe(detailImage);
        } else {
            detailImage.src = detailImage.dataset.src;
            detailImage.srcset = detailImage.dataset.srcset;
        }

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
            return;
        }

        showLoading();

        try {
            // Check cache first
            const cacheKey = `cached_product_${productId}`;
            const cachedData = localStorage.getItem(cacheKey);
            const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
            const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp, 10) : Infinity;

            let product;

            // Use cache if under 1 hour old (3600000 ms)
            if (cachedData && cacheAge < 3600000) {
                product = JSON.parse(cachedData);
            } else {
                const response = await fetch(`${API_BASE}/${productId}`);

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
                }

                product = await response.json();

                if (!product || !product.id) {
                    throw new Error("Invalid product data received.");
                }

                // Save to cache
                localStorage.setItem(cacheKey, JSON.stringify(product));
                localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
            }

            renderProduct(product);

        } catch (error) {
            showError();
        }
    }

    // ========================================
    // 6. FIREBASE AUTH STATE (nav update)
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
                        await firebase.auth().signOut();
                        localStorage.removeItem("currentUser");
                        window.location.href = "login.html";
                    } catch (error) {
                        console.error("Logout error:", error);
                    }
                });
            }
        } else {
            authNavItem.innerHTML = `<a href="login.html" class="nav__link">Login</a>`;
        }
    }

    if (typeof firebase !== "undefined") {
        firebase.auth().onAuthStateChanged((user) => {
            updateNavForAuth(user);
        });
    }

    // ========================================
    // 7. INITIALIZE
    // ========================================
    Cart.updateCartCount();
    fetchProduct();
});
