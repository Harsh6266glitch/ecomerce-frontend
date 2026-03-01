// ========================================
// E-Commerce Frontend — App JS (index.html)
// Uses shared Cart module from cart.js
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
        hamburger.querySelector(".hamburger__icon").innerHTML = isOpen ? '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-close"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
            hamburger.querySelector(".hamburger__icon").innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
            navLinks.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
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

    // ---- Create a Single Product Card ----
    function createProductCard(product, index) {
        const card = document.createElement("div");
        card.classList.add("product-card");
        card.style.animationDelay = `${index * 0.07}s`;
        card.dataset.productId = product.id;
        card.dataset.productTitle = product.title;
        card.dataset.productPrice = product.price;
        card.dataset.productImage = product.image;

        // --- Image Wrapper (clickable) ---
        const imageLink = document.createElement("a");
        imageLink.href = `product.html?id=${product.id}`;
        imageLink.classList.add("product-card__image-wrapper");

        const categoryBadge = document.createElement("span");
        categoryBadge.classList.add("product-card__category");
        categoryBadge.textContent = product.category;

        const image = document.createElement("img");
        image.classList.add("product-card__image");
        // Lazy loading observer data
        image.dataset.src = `https://images.weserv.nl/?url=${encodeURIComponent(product.image)}&output=webp&w=800`;
        image.dataset.srcset = `
            https://images.weserv.nl/?url=${encodeURIComponent(product.image)}&output=webp&w=400 400w,
            https://images.weserv.nl/?url=${encodeURIComponent(product.image)}&output=webp&w=800 800w
        `;
        // Provide a tiny placeholder
        image.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E`;
        image.width = 400;
        image.height = 400;
        image.alt = product.title;
        image.loading = "lazy";
        image.decoding = "async";

        imageLink.appendChild(categoryBadge);
        imageLink.appendChild(image);

        // --- Card Body ---
        const body = document.createElement("div");
        body.classList.add("product-card__body");

        const titleLink = document.createElement("a");
        titleLink.href = `product.html?id=${product.id}`;
        titleLink.classList.add("product-card__title-link");

        const title = document.createElement("h3");
        title.classList.add("product-card__title");
        title.textContent = product.title;
        titleLink.appendChild(title);

        const description = document.createElement("p");
        description.classList.add("product-card__description");
        description.textContent = truncateText(product.description, 80);

        const rating = document.createElement("div");
        rating.classList.add("product-card__rating");

        const stars = document.createElement("span");
        stars.classList.add("product-card__stars");
        stars.textContent = generateStars(product.rating.rate);

        const ratingCount = document.createElement("span");
        ratingCount.textContent = `(${product.rating.count})`;

        rating.appendChild(stars);
        rating.appendChild(ratingCount);

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

        body.appendChild(titleLink);
        body.appendChild(description);
        body.appendChild(rating);
        body.appendChild(footer);

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
            // Check cache first
            const cachedData = localStorage.getItem("cached_products");
            const cacheTimestamp = localStorage.getItem("cached_products_timestamp");
            const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp, 10) : Infinity;

            let products;

            // Use cache if under 1 hour old (3600000 ms)
            if (cachedData && cacheAge < 3600000) {
                products = JSON.parse(cachedData);
            } else {
                const response = await fetch(API_URL);

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
                }

                products = await response.json();

                // Save to cache
                localStorage.setItem("cached_products", JSON.stringify(products));
                localStorage.setItem("cached_products_timestamp", Date.now().toString());
            }

            if (productLoader) productLoader.style.display = "none";
            productGrid.innerHTML = "";

            if (!Array.isArray(products) || products.length === 0) {
                throw new Error("No products returned from API.");
            }

            const fragment = document.createDocumentFragment();
            products.forEach((product, index) => {
                const card = createProductCard(product, index);
                fragment.appendChild(card);
            });
            productGrid.appendChild(fragment);

            // Implement Intersection Observer Lazy Loading
            if ("IntersectionObserver" in window) {
                const lazyImageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const lazyImage = entry.target;
                            if (lazyImage.dataset.src) {
                                lazyImage.src = lazyImage.dataset.src;
                            }
                            if (lazyImage.dataset.srcset) {
                                lazyImage.srcset = lazyImage.dataset.srcset;
                            }
                            lazyImage.classList.add("loaded");
                            observer.unobserve(lazyImage);
                        }
                    });
                }, {
                    rootMargin: "0px 0px 50px 0px"
                });

                document.querySelectorAll(".product-card__image").forEach(lazyImage => {
                    lazyImageObserver.observe(lazyImage);
                });
            } else {
                document.querySelectorAll(".product-card__image").forEach(lazyImage => {
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.srcset = lazyImage.dataset.srcset;
                });
            }

        } catch (error) {
            showError();
        }
    }

    // ---- Retry Button ----
    if (retryBtn) {
        retryBtn.addEventListener("click", fetchProducts);
    }

    // ---- Add to Cart — Event Delegation (uses shared Cart module) ----
    productGrid.addEventListener("click", (e) => {
        const btn = e.target.closest(".product-card__add-btn");
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        const card = btn.closest(".product-card");

        const item = {
            id: parseInt(card.dataset.productId),
            title: card.dataset.productTitle,
            price: parseFloat(card.dataset.productPrice),
            image: card.dataset.productImage,
            quantity: 1,
        };

        // Use shared Cart module
        Cart.addToCart(item);
        Cart.showAddedFeedback(btn, null);
    });
    // ========================================
    // 3. FIREBASE AUTH STATE (nav update)
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
    // 4. INITIALIZE
    // ========================================
    Cart.updateCartCount();
    fetchProducts();
});
