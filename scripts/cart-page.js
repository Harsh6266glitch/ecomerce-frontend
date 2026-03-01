// ========================================
// E-Commerce Frontend — Cart Page JS
// Uses shared Cart module from cart.js
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("Cart Page Loaded");

    // ========================================
    // 1. NAVIGATION — Mobile Menu Toggle
    // ========================================
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");

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

    // ========================================
    // 2. DOM REFERENCES
    // ========================================
    const cartEmpty = document.getElementById("cartEmpty");
    const cartContent = document.getElementById("cartContent");
    const cartItemsEl = document.getElementById("cartItems");
    const summaryItemCount = document.getElementById("summaryItemCount");
    const summaryTotal = document.getElementById("summaryTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const clearCartBtn = document.getElementById("clearCartBtn");

    // ========================================
    // 3. RENDER CART
    // ========================================

    function renderCart() {
        const cart = Cart.getCart();

        // Empty state
        if (cart.length === 0) {
            cartEmpty.style.display = "";
            cartContent.style.display = "none";
            return;
        }

        cartEmpty.style.display = "none";
        cartContent.style.display = "";

        // Clear previous items
        cartItemsEl.innerHTML = "";

        let totalPrice = 0;
        let totalItems = 0;

        cart.forEach((item, index) => {
            const qty = item.quantity || 1;
            const subtotal = item.price * qty;
            totalPrice += subtotal;
            totalItems += qty;

            // ---- Cart Item Row ----
            const row = document.createElement("div");
            row.classList.add("cart-item");
            row.dataset.index = index;

            // Product info (image + title + variations)
            const productCol = document.createElement("div");
            productCol.classList.add("cart-item__product");

            const imgLink = document.createElement("a");
            imgLink.href = `product.html?id=${item.id}`;

            const img = document.createElement("img");
            img.classList.add("cart-item__image");
            img.src = item.image;
            img.alt = item.title;
            img.loading = "lazy";
            imgLink.appendChild(img);

            const info = document.createElement("div");
            info.classList.add("cart-item__info");

            const titleLink = document.createElement("a");
            titleLink.href = `product.html?id=${item.id}`;
            titleLink.classList.add("cart-item__title-link");

            const title = document.createElement("h3");
            title.classList.add("cart-item__title");
            title.textContent = item.title;
            titleLink.appendChild(title);
            info.appendChild(titleLink);

            // Variations
            if (item.size || item.color) {
                const vars = document.createElement("p");
                vars.classList.add("cart-item__variations");
                const parts = [];
                if (item.size) parts.push(`Size: ${item.size}`);
                if (item.color) parts.push(`Color: ${item.color}`);
                vars.textContent = parts.join("  ·  ");
                info.appendChild(vars);
            }

            productCol.appendChild(imgLink);
            productCol.appendChild(info);

            // Price
            const priceCol = document.createElement("div");
            priceCol.classList.add("cart-item__price");
            priceCol.textContent = `$${item.price.toFixed(2)}`;

            // Quantity controls
            const qtyCol = document.createElement("div");
            qtyCol.classList.add("cart-item__qty");

            const minusBtn = document.createElement("button");
            minusBtn.classList.add("cart-item__qty-btn");
            minusBtn.textContent = "−";
            minusBtn.setAttribute("aria-label", "Decrease quantity");
            minusBtn.addEventListener("click", () => {
                changeQuantity(index, -1);
            });

            const qtyDisplay = document.createElement("span");
            qtyDisplay.classList.add("cart-item__qty-value");
            qtyDisplay.textContent = qty;

            const plusBtn = document.createElement("button");
            plusBtn.classList.add("cart-item__qty-btn");
            plusBtn.textContent = "+";
            plusBtn.setAttribute("aria-label", "Increase quantity");
            plusBtn.addEventListener("click", () => {
                changeQuantity(index, 1);
            });

            qtyCol.appendChild(minusBtn);
            qtyCol.appendChild(qtyDisplay);
            qtyCol.appendChild(plusBtn);

            // Subtotal
            const subtotalCol = document.createElement("div");
            subtotalCol.classList.add("cart-item__subtotal");
            subtotalCol.textContent = `$${subtotal.toFixed(2)}`;

            // Remove button
            const removeCol = document.createElement("div");
            removeCol.classList.add("cart-item__remove");

            const removeBtn = document.createElement("button");
            removeBtn.classList.add("cart-item__remove-btn");
            removeBtn.innerHTML = "✕";
            removeBtn.setAttribute("aria-label", `Remove ${item.title}`);
            removeBtn.addEventListener("click", () => {
                removeItem(index);
            });

            removeCol.appendChild(removeBtn);

            // Assemble row
            row.appendChild(productCol);
            row.appendChild(priceCol);
            row.appendChild(qtyCol);
            row.appendChild(subtotalCol);
            row.appendChild(removeCol);

            cartItemsEl.appendChild(row);
        });

        // Update summary
        summaryItemCount.textContent = `${totalItems} item${totalItems !== 1 ? "s" : ""}`;
        summaryTotal.textContent = `$${totalPrice.toFixed(2)}`;

        // Enable/disable checkout
        checkoutBtn.disabled = cart.length === 0;
    }

    // ========================================
    // 4. QUANTITY CHANGE
    // ========================================

    function changeQuantity(index, delta) {
        const cart = Cart.getCart();
        if (!cart[index]) return;

        const newQty = cart[index].quantity + delta;

        if (newQty < 1) return; // Prevent below 1
        if (newQty > 99) return; // Cap at 99

        cart[index].quantity = newQty;
        cart[index].totalPrice = parseFloat((cart[index].price * newQty).toFixed(2));

        Cart.saveCart(cart);
        Cart.updateCartCount();
        renderCart();
    }

    // ========================================
    // 5. REMOVE ITEM
    // ========================================

    function removeItem(index) {
        const cart = Cart.getCart();
        if (!cart[index]) return;

        const removed = cart.splice(index, 1)[0];
        console.log(`🗑️ Removed: ${removed.title}`);

        Cart.saveCart(cart);
        Cart.updateCartCount();
        renderCart();
    }

    // ========================================
    // 6. CLEAR CART
    // ========================================

    clearCartBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear your entire cart?")) {
            Cart.clearCart();
            renderCart();
            console.log("🗑️ Cart cleared.");
        }
    });

    // ========================================
    // 7. CHECKOUT BUTTON
    // ========================================

    checkoutBtn.addEventListener("click", () => {
        const cart = Cart.getCart();
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // Require login for checkout
        const user = firebase.auth().currentUser;
        if (!user) {
            alert("Please log in to proceed to checkout.");
            window.location.href = "login.html";
            return;
        }

        window.location.href = "checkout.html";
    });

    // ========================================
    // 8. FIREBASE AUTH STATE (nav update)
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
    // 9. INITIALIZE
    // ========================================
    Cart.updateCartCount();
    renderCart();
});
