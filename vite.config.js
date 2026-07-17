import {defineConfig} from 'vite';
export default defineConfig({base:'/Portfolio/',build:{rollupOptions:{output:{manualChunks:{three:['three'],motion:['gsap','@studio-freight/lenis']}}}}});
