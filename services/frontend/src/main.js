import 'bootstrap/dist/css/bootstrap.css';
import "@mdi/font/css/materialdesignicons.min.css";
import { createApp } from 'vue';
import axios from 'axios';
import { createPinia } from "pinia";
import '../node_modules/maplibre-gl/dist/maplibre-gl.css';
import App from './App.vue';
import router from './router';

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


const app = createApp(App);

axios.defaults.withCredentials = true;

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
          mdi,
        },
    },
})

app.use(router);
app.use(createPinia());
app.use(vuetify);
app.mount("#app");