// ========================================
// E-Commerce Frontend — Cart Utilities
// Shared module for cross-page cart persistence
// ========================================

const Cart = (() => {
    "use strict";

    const STORAGE_KEY = "cart";
    const MAX_QTY = 99;
    const MIN_QTY = 1;

    // ---- Get Cart from localStorage ----
    function getCart() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            // Validate: must be an array of objects with id
            if (!Array.isArray(parsed)) return [];
            return parsed.filter((item) => item && typeof item.id !== "undefined");
        } catch (e) {
            console.warn("⚠️ Cart data corrupted, resetting.", e);
            localStorage.removeItem(STORAGE_KEY);
            return [];
        }
    }

    // ---- Save Cart to localStorage ----
    function saveCart(cart) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        } catch (e) {
            console.error("❌ Failed to save cart:", e);
        }
    }

    // ---- Get Total Item Count ----
    function getCartCount() {
        return getCart().reduce((sum, item) => sum + (item.quantity || 1), 0);
    }

    // ---- Update Cart Badge in Navigation ----
    function updateCartCount() {
        const badge = document.getElementById("cartBadge");
        if (!badge) return;

        const count = getCartCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? "flex" : "none";

        // Small pop animation
        badge.style.transform = "scale(1.3)";
        setTimeout(() => {
            badge.style.transform = "scale(1)";
        }, 200);
    }

    // ---- Add Item to Cart ----
    // item must have: { id, title, price, image }
    // optional: { size, color, quantity }
    function addToCart(item) {
        if (!item || typeof item.id === "undefined") {
            console.error("❌ Invalid item: missing id.");
            return false;
        }

        const cart = getCart();

        // Sanitize quantity
        let qty = parseInt(item.quantity) || 1;
        if (qty < MIN_QTY) qty = MIN_QTY;
        if (qty > MAX_QTY) qty = MAX_QTY;

        // Check for existing item with same id + same variations
        const existingIndex = cart.findIndex(
            (c) =>
                c.id === item.id &&
                (c.size || "") === (item.size || "") &&
                (c.color || "") === (item.color || "")
        );

        if (existingIndex !== -1) {
            // Increase quantity, capped at MAX_QTY
            const newQty = cart[existingIndex].quantity + qty;
            cart[existingIndex].quantity = Math.min(newQty, MAX_QTY);
            cart[existingIndex].totalPrice = parseFloat(
                (cart[existingIndex].price * cart[existingIndex].quantity).toFixed(2)
            );
        } else {
            // Add new entry
            cart.push({
                id: item.id,
                title: item.title || "Unnamed Product",
                price: parseFloat(item.price) || 0,
                image: item.image || "",
                size: item.size || "",
                color: item.color || "",
                quantity: qty,
                totalPrice: parseFloat((parseFloat(item.price) * qty).toFixed(2)),
                addedAt: new Date().toISOString(),
            });
        }

        saveCart(cart);
        updateCartCount();

        console.log(
            `🛒 Cart updated: ${item.title} (x${qty}) | Total items: ${getCartCount()}`
        );

        return true;
    }

    // ---- Remove Item from Cart ----
    function removeFromCart(id, size, color) {
        let cart = getCart();
        cart = cart.filter(
            (c) =>
                !(
                    c.id === id &&
                    (c.size || "") === (size || "") &&
                    (c.color || "") === (color || "")
                )
        );
        saveCart(cart);
        updateCartCount();
    }

    // ---- Clear Entire Cart ----
    function clearCart() {
        localStorage.removeItem(STORAGE_KEY);
        updateCartCount();
    }

    // ---- Show Success Feedback ----
    function showAddedFeedback(button, confirmationEl) {
        if (!button) return;

        const originalText = button.textContent;
        const originalBg = button.style.background;

        // Button feedback
        button.textContent = "✓ Added to Cart!";
        button.style.background = "linear-gradient(135deg, #00b894, #00cec9)";
        button.disabled = true;

        // Confirmation element
        if (confirmationEl) {
            confirmationEl.style.display = "flex";
            confirmationEl.style.gap = "8px";
            confirmationEl.style.alignItems = "center";
            confirmationEl.style.animation = "fadeInUp 0.3s ease-out";
        }

        // Reset after delay
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = originalBg;
            button.disabled = false;

            if (confirmationEl) {
                confirmationEl.style.display = "none";
            }
        }, 2000);
    }

    // ---- Public API ----
    return {
        getCart,
        saveCart,
        getCartCount,
        updateCartCount,
        addToCart,
        removeFromCart,
        clearCart,
        showAddedFeedback,
    };
})();
