import { createToastInterface } from "vue-toastification";
import "vue-toastification/dist/index.css";

// Konfigurasi default
const options = {
    position: "top-right",
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: false,
    pauseOnHover: true,
    draggable: true,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false
};

// Buat instance toast
const toast = createToastInterface(options);

export default toast;
