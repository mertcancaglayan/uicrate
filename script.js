import { fetchComponent } from "./fetchScript.js";

const resultsGrid = document.getElementById("resultsGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const paginationContainer = document.getElementById("pagination");
const noResults = document.getElementById("noResults");
const searchLength = document.querySelector("#searchLength");
const filterChips = document.querySelectorAll(".filter-chip");

let componentsData = {};
let allComponents = [];
let filteredComponents = [];
let itemsPerPage = 20;
let currentPage = 1;
let totalPages = 1;

async function getData() {
	try {
		const response = await fetch("components-index.json");
		if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

		const data = await response.json();
		if (data && Object.keys(data).length > 0) {
			componentsData = data;

			allComponents = Object.values(componentsData)
				.map((category) => Object.values(category).flat())
				.flat();

			filteredComponents = [...allComponents];
			handleSearch();
		} else {
			resultsGrid.innerHTML = `<p class="no-data">No components available.</p>`;
		}
	} catch (error) {
		console.error("Error fetching data:", error);
		resultsGrid.innerHTML = `<p class="error">Failed to load components.</p>`;
	}
}

function debounce(func, timeout = 300) {
	let timer;
	return function (...args) {
		clearTimeout(timer);
		timer = setTimeout(() => func.apply(this, args), timeout);
	};
}

function filterActiveClass(chip) {
	filterChips.forEach((chipEl) => chipEl.classList.remove("active"));
	chip.classList.add("active");
}

function filterResults(btn) {
	const filterType = btn.parentElement.getAttribute("data-type");
	const filterCategory = btn.getAttribute("data-category");

	if (filterCategory === "all") {
		filteredComponents = Object.values(componentsData[filterType] || {}).flat();
	} else {
		filteredComponents = componentsData[filterType]?.[filterCategory] || [];
	}
	handleSearch();
}

function sortResults(components) {
	return components.slice().sort((a, b) => {
		return sortSelect.value === "recent" ? new Date(b.date) - new Date(a.date) : a.name.localeCompare(b.name);
	});
}

const wideCategories = [
	"cards",
	"navigations",
	"tabs",
	"tooltips",
	"breadcrumbs",
	"tabs",
	"sliders",
	"cta",
	"features",
	"footer",
	"galleries",
	"hero",
	"testimonials",
	"contact",
	"login",
];

const narrowCategories = ["loaders", "socials", "alerts", "toggles"];

let previewCategories = wideCategories + narrowCategories;

resultsGrid.addEventListener("click", (e) => {
	if (e.target.closest(".wideBtn")) {
		makeWider(e.target.closest(".wideBtn"));
	}
});

function makeWider(btn) {
	const previewCard = btn.closest(".preview-card");

	if (previewCard.classList.contains("wide")) {
		previewCard.classList.remove("wide");
	} else {
		document.querySelectorAll(".preview-card.wide").forEach((card) => {
			card.classList.remove("wide");
		});
		previewCard.classList.add("wide");
	}
	scrollTop();
}

function displayResults(components) {
	if (components.length === 0) {
		noResults.style.display = "block";
		resultsGrid.innerHTML = "";
	} else {
		noResults.style.display = "none";

		resultsGrid.innerHTML = components
			.map(({ image, name, file, category }) => {
				const imageUrl = image || "https://placehold.co/600x400/png?text=No+Image";
				const componentFile = file ? encodeURIComponent(file) : "#";
				const componentName = name || "Unnamed Component";

				const mediaPreview = narrowCategories.includes(category)
					? `<iframe class="loader-preview" data-file="${componentFile}" style="width:100%; height:100%; border-radius:12px; overflow:hidden;"></iframe> \n <img style= "display:none" src="${imageUrl}" onerror="this.onerror=null; this.src='https://placehold.co/600x400/png?text=No+Image';" alt="${componentName}" loading="lazy" />`
					: `<iframe style = "display:none" class="loader-preview" data-file="${componentFile}" style="width:100%; height:100%; border-radius:12px; overflow:hidden;"></iframe> \n <img src="${imageUrl}" onerror="this.onerror=null; this.src='https://placehold.co/600x400/png?text=No+Image';" alt="${componentName}" loading="lazy" />`;

				return `
					<article class="preview-card" data-category="${category}">
						<div class="preview-card-content">
							${mediaPreview}
						</div>
						<div class="preview-card-footer">
							<p>${componentName}</p>
							<a href="editor-page.html?component=${componentFile}" target="_blank" aria-label="View code for ${componentName}">
								<span>Go to Code</span>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
									<path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5-34.7 22-39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"/>
								</svg>
							</a>
							<button class="wideBtn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z"/></svg></button>
						</div>
					</article>
				`;
			})
			.join("");

		loadLoaderPreviews();
	}
}

function loadLoaderPreviews() {
	const loaderPreviews = document.querySelectorAll(".loader-preview");

	loaderPreviews.forEach((preview) => {
		const file = preview.getAttribute("data-file");
		if (file) {
			fetchComponent(file).then((component) => {
				if (component && component.html) {
					const componentStyles = `<style>${component.style}</style>` || "";
					const componentScript = `<script>${component.script}</script>` || "";
					const componentHtml = component.html || "";

					const loaderPreview = document.querySelector(`iframe[data-file="${file}"]`);

					const autoScaleScript = `
						<script>
							window.addEventListener('DOMContentLoaded', () => {
								const containerWidth = window.innerWidth;
								const containerHeight = window.innerHeight;

								const body = document.body;
								const contentWidth = body.scrollWidth;
								const contentHeight = body.scrollHeight;

								const scaleX = containerWidth / contentWidth;
								const scaleY = containerHeight / contentHeight;
								const scale = Math.min(scaleX, scaleY, 1); 

								body.style.transform = 'scale(' + scale + ')';
								body.style.transformOrigin = 'top left';
								body.style.width = (100 / scale) + '%';
								body.style.height = (100 / scale) + '%';
								body.style.overflow = 'hidden';
							});
						<\/script>
					`;

					const antiNavigationScript = `
					<script>
						document.querySelectorAll('a').forEach(link => {
							link.addEventListener('click', function(event) {
								event.preventDefault();
							});
						});
					<\/script>
				`;

					loaderPreview.contentWindow.document.open();
					loaderPreview.contentWindow.document.write(
						componentStyles,
						componentHtml,
						componentScript,
						antiNavigationScript,
						autoScaleScript,
					);
					loaderPreview.contentWindow.document.close();
				}
			});
		}
	});
}

let prevTotalPages = 0;

function generatePagination(currentPage) {
	totalPages = Math.ceil(filteredComponents.length / itemsPerPage) || 1;

	if (prevTotalPages !== totalPages) {
		paginationContainer.innerHTML = "";
		for (let i = 1; i <= totalPages; i++) {
			const button = document.createElement("button");
			button.textContent = i;
			button.dataset.page = i;
			button.addEventListener("click", () => changePage(i));
			if (i === currentPage) {
				button.classList.add("active");
			}
			paginationContainer.appendChild(button);
		}
		prevTotalPages = totalPages;
	} else {
		updateActiveButton(currentPage);
	}
}

function updateActiveButton(currentPage) {
	const buttons = paginationContainer.querySelectorAll("button");
	buttons.forEach((button) => {
		if (parseInt(button.dataset.page) === currentPage) {
			button.classList.add("active");
		} else {
			button.classList.remove("active");
		}
	});
}

function changePage(page) {
	searchLength.textContent = filteredComponents.length;

	currentPage = page;

	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedComponents = filteredComponents.slice(startIndex, endIndex);

	displayResults(paginatedComponents);
	generatePagination(currentPage);

	scrollTop();
}

function handleSearch() {
	const query = searchInput.value.toLowerCase();

	const searchedComponents = filteredComponents.filter(({ name }) => name.toLowerCase().includes(query));
	filteredComponents = sortResults(searchedComponents);

	changePage(1);
}

const debouncedHandleSearch = debounce(handleSearch, 300);

const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

searchInput.addEventListener("input", debouncedHandleSearch);
sortSelect.addEventListener("change", handleSearch);
filterChips.forEach((btn) => {
	btn.addEventListener("click", () => {
		filterActiveClass(btn);
		filterResults(btn);
	});
});

document.querySelector(".all-assets-btn").addEventListener("click", (e) => {
	filterActiveClass(e.target);

	filteredComponents = sortResults([...allComponents]);

	changePage(1);
});

getData();
