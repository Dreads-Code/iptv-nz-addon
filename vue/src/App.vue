<template>
    <div>
        <div class="bg-img relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-no-repeat bg-cover bg-center"
            :style="`background-image: url(${manifest.background});`">
            
            <!-- Main Card -->
            <div class="max-w-md w-full space-y-8 p-10 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl z-10 border border-white/20">

                <div class="grid gap-8 grid-cols-1">
                    <div class="flex flex-col">
                        <!-- Header -->
                        <div class="items-center header text-center">
                            <img class="logo mx-auto drop-shadow-md" :src="manifest.logo">
                            <h1 class="font-bold text-3xl text-gray-900 mt-4 mb-1 tracking-tight">{{ manifest.name }}</h1>
                            <h2 class="font-medium text-sm text-gray-500 mb-6">Version: {{ manifest.version }}</h2>
                            <p class="text-gray-700 leading-relaxed">{{ manifest.description }}</p>
                        </div>

                        <div class="flex items-center justify-center space-x-2 mt-6">
                            <span class="h-px w-full bg-gray-300/50"></span>
                        </div>

                        <!-- Description -->
                        <div class="items-center mt-6 description">
                            <h2 class="font-semibold text-lg text-gray-800 mb-2">This addon contains:</h2>
                            <ul class="list-disc list-inside text-gray-600" v-html="stylizedTypes.map(t => `<li>${t}</li>`).join('')"></ul>
                        </div>

                        <div class="flex items-center justify-center space-x-2 mt-8">
                            <span class="h-px w-full bg-gray-300/50"></span>
                        </div>

                        <!-- Install Buttons -->
                        <div class="mt-8 flex flex-col space-y-4">
                            <a id="install_button" :href="installUrl" class="w-full">
                                <button type="button"
                                    class="w-full text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 font-bold rounded-xl text-lg px-5 py-4 text-center shadow-lg transform transition hover:-translate-y-0.5">
                                    Install Addon
                                </button>
                            </a>
                            <a id="web_install_button" :href="webInstallUrl" target="_blank" class="w-full">
                                <button type="button"
                                    class="w-full text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 font-bold rounded-xl text-lg px-5 py-4 text-center shadow-lg transform transition hover:-translate-y-0.5">
                                    Install on Stremio Web
                                </button>
                            </a>
                        </div>

                        <!-- Footer -->
                        <div class="mt-6 flex flex-col">
                            <p class="text-center text-sm text-gray-500">
                                Created by <a href="https://github.com/Dreads-Code" target="_blank" class="text-blue-600 hover:text-blue-800 font-medium transition-colors">Dreads-Code</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useHead } from "@vueuse/head";
import * as manifest from '../../manifest.json';

const stylizedTypes = manifest.types.map(t => t[0].toUpperCase() + t.slice(1));

useHead({
    title: manifest.name + ' - Stremio Addon',
    link: [
        {
            rel: "icon",
            type: "image/svg+xml",
            href: manifest.logo,
        }
    ],
})

const installUrl = ref('#');
const webInstallUrl = ref('#');

onMounted(() => {
    const host = window.location.host;
    const protocol = window.location.protocol;
    const manifestUrl = protocol + '//' + host + '/manifest.json';
    
    installUrl.value = 'stremio://' + host + '/manifest.json';
    webInstallUrl.value = 'https://web.stremio.com/#/addon/' + encodeURIComponent(manifestUrl);
});

</script>


<style scoped>
.logo {
    max-width: 200px;
}

.bg-img {
    background-attachment: fixed;
}

/* width */
::-webkit-scrollbar {
    width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
    background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
    background: rgb(26 86 219 / var(--tw-bg-opacity));
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
    background: #225C7D;
}
</style>