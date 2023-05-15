import 'bootstrap/dist/css/bootstrap.css';
import { createApp } from 'vue';
import axios from 'axios';
import { createPinia } from "pinia";
import '../node_modules/maplibre-gl/dist/maplibre-gl.css';
import App from './App.vue';
import router from './router';

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


const app = createApp(App);

axios.defaults.withCredentials = true;

const vuetify = createVuetify({
    components,
    directives,
})

app.use(router);
app.use(createPinia());
app.use(vuetify);
app.mount("#app");