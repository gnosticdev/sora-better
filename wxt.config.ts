import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'wxt'

export default defineConfig({
	webExt: {
		binaries: {
			chrome: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
		},
		startUrls: ['https://sora.chatgpt.com'],
		chromiumProfile:
			'/Users/divinelight/Library/Application Support/BraveSoftware/Brave-Browser/Default',
		chromiumArgs: [
			'--user-data-dir=~/Library/Application Support/BraveSoftware/Brave-Browser/',
		],
		disabled: true,
	},
	debug: true,
	modules: ['@wxt-dev/module-solid'],
	manifest: {
		name:
			process.env.NODE_ENV === 'development'
				? 'Sora Better Dev'
				: 'Sora Better',
		permissions: ['tabs', 'storage', 'activeTab', 'background'],
		version: '1.0.0',
		description:
			'Enhance your Sora experience with video optimization and watermark removal.',
		action: {},
		minimum_chrome_version: '114',
		host_permissions: ['https://api.kie.ai/*'],
	},
	srcDir: 'src',
	vite: () => ({
		plugins: [tailwindcss()],
	}),
})
