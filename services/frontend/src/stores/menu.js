import { defineStore } from 'pinia'

export const useMenuStore = defineStore ({
    id: 'menu',
    state: () => ({
        activeMenu: null,
        workspace: null
    }),
    actions: {
        setActivatedMenu (payload) {
            this.activeMenu=payload
        },
        setWorkspace (payload) {
            this.workspace=payload
        }
    }
})