
/* ==========================================
   EGG PALACE GHANA
   COMPLETE WEBSITE JAVASCRIPT

   Features:
   - Add and remove order products
   - Update selected product summary
   - Farm pickup or delivery selection
   - WhatsApp order enquiries
   - Email backup enquiries
   - Mobile navigation
========================================== */

(function () {

    "use strict";

    // ======================================
    // GET WEBSITE ELEMENTS
    // ======================================

    const form =
        document.getElementById("order-form");

    const itemsBox =
        document.getElementById("order-items");

    const template =
        document.getElementById("order-item-template");

    const addButton =
        document.getElementById("add-product");

    const emailBackup =
        document.getElementById("email-backup");

    const summary =
        document.getElementById("order-summary");

    const status =
        document.getElementById("order-status");

    const deliveryWrap =
        document.getElementById("delivery-location-wrap");

    const deliveryLocation =
        document.getElementById("delivery-location");

    const maxItems = 10;


    // ======================================
    // UPDATE PRODUCT SELECTION
    // ======================================

    function refreshRows() {

        const rows = [
            ...itemsBox.querySelectorAll(".order-item")
        ];

        rows.forEach((row, index) => {

            const product =
                row.querySelector(".item-product");

            const quantity =
                row.querySelector(".item-quantity");

            const removeButton =
                row.querySelector(".remove-item-btn");

            product.setAttribute(
                "aria-label",
                "Product " + (index + 1)
            );

            quantity.setAttribute(
                "aria-label",
                "Quantity for product " + (index + 1)
            );

            removeButton.setAttribute(
                "aria-label",
                "Remove product " + (index + 1)
            );

            // Keep at least one product row
            removeButton.hidden = rows.length === 1;

        });

        addButton.disabled = rows.length >= maxItems;

        const selected = rows.map(row => {

            const product =
                row.querySelector(".item-product");

            const quantity =
                row.querySelector(".item-quantity");

            const amount = Number(quantity.value);

            if (
                !product.value ||
                !Number.isInteger(amount) ||
                amount < 1
            ) {
                return null;
            }

            const option =
                product.options[product.selectedIndex];

            const label = option.text.trim();

            return amount + " × " + label;

        }).filter(Boolean);

        summary.textContent = selected.length
            ? "Selected: " + selected.join(" • ")
            : "Choose a product to start your enquiry.";

    }


    // ======================================
    // ADD NEW PRODUCT ROW
    // ======================================

    function addRow() {

        if (itemsBox.children.length >= maxItems) {
            return;
        }

        const newRow =
            template.content.cloneNode(true);

        itemsBox.appendChild(newRow);

        refreshRows();

    }

    addButton.addEventListener("click", () => {

        addRow();

        const selects =
            itemsBox.querySelectorAll(".item-product");

        selects[selects.length - 1].focus();

    });


    // ======================================
    // AUTOMATIC PRODUCT SUMMARY
    // ======================================

    itemsBox.addEventListener(
        "input",
        refreshRows
    );

    itemsBox.addEventListener(
        "change",
        refreshRows
    );


    // ======================================
    // REMOVE SELECTED PRODUCT
    // ======================================

    itemsBox.addEventListener("click", event => {

        if (
            !event.target.classList.contains(
                "remove-item-btn"
            )
        ) {
            return;
        }

        const rows =
            itemsBox.querySelectorAll(".order-item");

        if (rows.length <= 1) {
            return;
        }

        event.target.closest(".order-item").remove();

        refreshRows();

    });


    // ======================================
    // FARM PICKUP OR DELIVERY
    // ======================================

    const fulfilmentRadios =
        form.querySelectorAll(
            'input[name="fulfilment"]'
        );

    function updateDeliveryFields() {

        const selectedMethod =
            form.querySelector(
                'input[name="fulfilment"]:checked'
            ).value;

        const isDelivery =
            selectedMethod === "Delivery enquiry";

        deliveryWrap.hidden = !isDelivery;

        deliveryLocation.required = isDelivery;

        if (!isDelivery) {
            deliveryLocation.value = "";
        }

    }

    fulfilmentRadios.forEach(radio => {

        radio.addEventListener(
            "change",
            updateDeliveryFields
        );

    });

    updateDeliveryFields();


    // ======================================
    // VALIDATE AND PREPARE ENQUIRY
    // ======================================

    function prepareMessage() {

        status.textContent = "";

        if (!form.reportValidity()) {
            return null;
        }

        const rows = [
            ...itemsBox.querySelectorAll(".order-item")
        ];

        const products = rows.map((row, index) => {

            const product =
                row.querySelector(".item-product");

            const quantity =
                row.querySelector(".item-quantity").value;

            const selectedOption =
                product.options[product.selectedIndex];

            const productName = selectedOption.text.trim();

            const unit =
                selectedOption.dataset.unit || "item(s)";

            return (
                (index + 1) + ". " +
                productName + " - " +
                quantity + " " + unit
            );

        });


        // CUSTOMER CONTACT DETAILS

        const name =
            document.getElementById(
                "customer-name"
            ).value.trim();

        const phone =
            document.getElementById(
                "customer-phone"
            ).value.trim();

        const email =
            document.getElementById(
                "customer-email"
            ).value.trim();


        // DELIVERY OR COLLECTION

        const method =
            form.querySelector(
                'input[name="fulfilment"]:checked'
            ).value;

        const location =
            deliveryLocation.value.trim();

        const notes =
            document.getElementById(
                "order-notes"
            ).value.trim();


        // CHECK REQUIRED DETAILS

        if (
            !name ||
            !phone ||
            (
                method === "Delivery enquiry" &&
                !location
            )
        ) {

            status.textContent =
                "Please complete all required details.";

            return null;

        }


        // BUILD CUSTOMER ORDER MESSAGE

        const message = [

            "Hello Egg Palace Ghana! 🐓🥚",

            "",

            "I would like to enquire about the following products:",

            "",

            ...products,

            "",

            "CUSTOMER INFORMATION",

            "Name: " + name,

            "Phone: " + phone,

            "Email: " + (email || "Not provided"),

            "",

            "ORDER ARRANGEMENTS",

            "Method: " + method,

            ...(
                method === "Delivery enquiry"
                    ? ["Delivery Location: " + location]
                    : []
            ),

            "",

            "Additional Details: " +
                (notes || "None"),

            "",

            "Please confirm current prices,",
            "stock availability and delivery",
            "charges where applicable.",

            "",

            "Thank you!"

        ].join("\n");


        return {
            name: name,
            message: message
        };

    }


    // ======================================
    // WHATSAPP ORDER ENQUIRY
    // ======================================

    form.addEventListener("submit", event => {

        event.preventDefault();

        const enquiry = prepareMessage();

        if (!enquiry) {
            return;
        }

        // Customer selects which business number

        const selectedNumber =
            form.querySelector(
                'input[name="whatsappNumber"]:checked'
            ).value;

        // Prepare WhatsApp URL

        const whatsappURL =
            "https://wa.me/" +
            selectedNumber +
            "?text=" +
            encodeURIComponent(enquiry.message);

        status.textContent =
            "Opening WhatsApp. Review your enquiry and press Send.";

        // Open WhatsApp

        window.location.assign(whatsappURL);

    });


    // ======================================
    // BACKUP EMAIL ENQUIRY
    // ======================================

    emailBackup.addEventListener("click", () => {

        const enquiry = prepareMessage();

        if (!enquiry) {
            return;
        }

        const subject =
            "Egg Palace Ghana Order Enquiry - " +
            enquiry.name;

        const emailURL =
            "mailto:palaceegg@gmail.com" +
            "?subject=" +
            encodeURIComponent(subject) +
            "&body=" +
            encodeURIComponent(enquiry.message);

        status.textContent =
            "Opening your email app. Review the enquiry and press Send.";

        window.location.assign(emailURL);

    });


    // ======================================
    // MOBILE NAVIGATION
    // ======================================

    const mobileMenu =
        document.querySelector(".mobile-menu");

    if (mobileMenu) {

        mobileMenu.querySelectorAll(
            "nav a"
        ).forEach(link => {

            link.addEventListener("click", () => {

                mobileMenu.open = false;

            });

        });

    }


    // ======================================
    // INITIALIZE ORDER FORM
    // ======================================

    addRow();

})();
