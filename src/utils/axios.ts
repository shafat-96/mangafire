import axios from 'axios';
import { USER_AGENT_HEADER, ACCEPT_ENCODING_HEADER, ACCEPT_HEADER, SRC_BASE_URL, ACCEPT_LANGUAGE_HEADER } from './index';

// Read proxy configuration from environment variables
const proxyHost = process.env.PROXY_HOST;
const proxyPort = process.env.PROXY_PORT ? parseInt(process.env.PROXY_PORT, 10) : undefined;
const proxyUsername = process.env.PROXY_USERNAME;
const proxyPassword = process.env.PROXY_PASSWORD;

const proxyConfig = (proxyHost && proxyPort) ? {
    host: proxyHost,
    port: proxyPort,
    auth: (proxyUsername && proxyPassword) ? {
        username: proxyUsername,
        password: proxyPassword,
    } : undefined,
    protocol: 'http'
} : false;


const api = axios.create({
    headers: {
        'User-Agent': USER_AGENT_HEADER,
        'Accept-Encoding': ACCEPT_ENCODING_HEADER,
        'Accept': ACCEPT_HEADER,
        'Referer': SRC_BASE_URL,
        'Accept-Language': ACCEPT_LANGUAGE_HEADER,
    },
    proxy: proxyConfig,
});

// Add detailed error logging
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error)) {
            console.error('Axios error occurred:');
            console.error('Error status:', error.response?.status);
            console.error('Error status text:', error.response?.statusText);
            console.error('Response Headers:', error.response?.headers);
            console.error('Request Config:', error.config);
        } else {
            console.error('An unexpected error occurred:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
