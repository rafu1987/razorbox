// Build-time stylesheet entry. Vite extracts this into dist/razorbox.css.
// The published JS bundle does not inject CSS or add any <style> elements.
import './scss/razorbox.scss'
export { razorbox } from './razorbox.js'
export { default } from './razorbox.js'
