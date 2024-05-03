import { defineStore } from 'pinia'

export const useAlertStore = defineStore ({
    id: 'alert',
    state: () => ({
        snackbar: false,
        text: "alert text",
        timeout: 2000,
        btnColor: "pink"
    }),
    actions: {
       setAlert(data) {
        this.snackbar=true
        this.text = data.text
        this.timeout = data.timeout,
        this.btnColor = data.btnColor
       }
       
    }
})