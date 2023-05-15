import 'bootstrap/dist/css/bootstrap.css';
import { createApp } from 'vue';
import axios from 'axios';
import { createPinia } from "pinia";

import App from './App.vue';
import router from './router';

const app = createApp(App);

axios.defaults.withCredentials = true;

app.use(router);
app.use(createPinia());
app.mount("#app");