# LawnCarePros Scheduler

A browser-based scheduling and billing tool for a landscaping and holiday lights business. Built with vanilla HTML, CSS, and JavaScript — no frameworks.

## Description

LawnCarePros Scheduler lets a small business owner or office worker manage customer jobs in one place. You can view scheduled and completed jobs, filter by status or service type, search by customer name or address, add new jobs, edit existing ones, mark jobs as paid, and see pricing totals update automatically based on the selected service type.

## How to Run

No install or build step needed. Just open the project folder and launch `index.html` in a browser.

**Option 1 — Direct open:**
Double-click `index.html` in Finder or File Explorer.

**Option 2 — Local server (recommended, avoids fetch restrictions):**
```bash
cd lawncarepros
npx serve .
```
Then open `http://localhost:3000` in your browser.

Or with Python:
```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080`.

## Data Source Credits

All job and pricing data is loaded asynchronously from `data.json`, a local JSON file included in this project. The data is sample/mock data created for this assignment. No external API is used.

## AI Assistance Disclosure

I used Claude (Anthropic) to help build this project. Specifically, Claude helped me structure the async fetch function that loads data.json on page load, the filter and search logic that chains multiple conditions to narrow down the jobs array, and the modal form's open/close/populate pattern for both adding and editing jobs. I reviewed and understand all of the code, including how the DOM is updated after each state change and how the pricing display updates dynamically when the service type selector changes.
