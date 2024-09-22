import axios from 'axios';

const baseURL = "http://localhost:3952"
const api = axios.create({
    baseURL,
    withCredentials: true,
});

export default api;
