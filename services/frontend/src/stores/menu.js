import { defineStore } from 'pinia'

export const useMenuStore = defineStore ({
    id: 'menu',
    state: () => ({
        activeMenu: null,
    }),
    actions: {
        setActivatedMenu (payload) {
            this.activeMenu=payload
        }
    }
})