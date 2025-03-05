const circle = document.getElementById("circle");
const header = document.querySelector("header");
const navSections = document.querySelectorAll(".navSection");

let firstHover = 0;

header.addEventListener("mousemove", function (event) {
	if (window.innerWidth <= 1000) {
		return;
	}
	displayCircle();
});

function displayCircle() {
	document.body.style.cursor = "none";

	circle.style.display = "flex";
	const x = event.clientX;
	const y = event.clientY;

	if (firstHover === 0) {
		circle.style.left = `${x}px`;
		circle.style.top = `${y}px`;
		firstHover++;
	} else {
		circle.style.left = `${x - circle.offsetWidth / 2}px`;
		circle.style.top = `${y - circle.offsetHeight / 2}px`;
	}
}

header.addEventListener("mouseout", function () {
	circle.style.display = "none";
	document.body.style.cursor = "default";
});

navSections.forEach((navSection) => {
	let navItems = navSection.querySelectorAll(".navItem");
	navItems.forEach((item) => {
		item.addEventListener("mouseover", function () {
			circle.style.transform = "scale(2)";
		});

		item.addEventListener("mouseout", function () {
			circle.style.transform = "scale(1)";
		});
	});
});

document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll(".filter-title").forEach((title) => {
		if (title.classList.contains("open")) {
			const subSection = title.nextElementSibling;
			setTimeout(() => {
				subSection.style.maxHeight = "fit-content";
			}, 300);
		}

		title.addEventListener("click", () => {
			toggleSubSection(title);
		});
	});
});

function toggleSubSection(title) {
	const subSection = title.nextElementSibling;

	if (subSection.style.maxHeight) {
		subSection.style.maxHeight = null;
	} else {
		subSection.style.maxHeight = subSection.scrollHeight + "px";
	}

	title.classList.toggle("open");
}

const mobileNav = document.querySelector(".mobile-nav");
const toggleBtn = document.getElementById("toggleBtn");
const links = mobileNav.querySelectorAll(".mobile-nav-item");

links.forEach((link) => {
	link.addEventListener("click", () => {
		links.forEach((item) => item.classList.remove("active"));
		link.classList.add("active");
	});
});

toggleBtn.addEventListener("click", () => {
	mobileNav.classList.toggle("active");
	toggleBtn.classList.toggle("active");
});

const themeSwitch = document.getElementById("themeSwitch");
let isDark = document.body.getAttribute("data-theme") === "dark";

function updateTheme() {
	document.body.setAttribute("data-theme", isDark ? "light" : "dark");
	themeSwitch.innerHTML = isDark
		? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"/></svg>'
		: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/></svg>';
	localStorage.setItem("theme", isDark ? "dark" : "light");
}

themeSwitch.addEventListener("click", () => {
	isDark = !isDark;
	updateTheme();
});

const searchInput = document.getElementById("searchInput");
const resultsGrid = document.getElementById("resultsGrid");
const sortSelect = document.getElementById("sortSelect");
let activeFilters = {
	category: "all",
	type: "all",
	sort: "recent",
};

let allResults = [];

// Fetch component data
function getData() {
	fetch("components-index.json")
		.then((response) => response.json())
		.then((result) => {
			if (Array.isArray(result) && result.length > 0) {
				allResults = result;
				handleSearch();
			} else {
				resultsGrid.innerHTML = `<p class="no-data">No components available.</p>`;
			}
		})
		.catch((error) => {
			resultsGrid.innerHTML = `<p class="error">Failed to load components.</p>`;
		});
}
getData();

searchInput.addEventListener("input", debounce(handleSearch, 300));
sortSelect.addEventListener("change", handleSearch);

document.querySelector(".all-assets-btn").addEventListener("click", (e) => {
	activeFilters = { category: "all", type: "all", sort: sortSelect.value };
	filterActiveClass(e.target);
	handleSearch();
});

document.querySelectorAll(".filter-chip").forEach((chip) => {
	chip.addEventListener("click", () => {
		filterActiveClass(chip);
		filterItems(chip);
	});
});

function filterActiveClass(chip) {
	const filterChips = document.querySelectorAll(".filter-chip");
	filterChips.forEach((i) => i.classList.remove("active"));
	chip.classList.add("active");
}

function filterItems(chip) {
	const parentGroup = chip.closest(".filter-group");
	const filterType = parentGroup.querySelector(".filter-title") ? "category" : "type";

	if (chip.dataset.category === "all") {
		activeFilters[filterType] = chip.getAttribute("data-type");
	} else {
		activeFilters[filterType] = chip.getAttribute("data-category");
	}

	handleSearch();
}

let itemsPerPage = 20;
let currentPage = 1;
let totalPages;

let currentResults = [];

const paginationContainer = document.getElementById("pagination");
function generatePagination(totalPages, currentPage) {
	let buttons = "";
	for (let i = 1; i <= totalPages; i++) {
		buttons += `<button onclick="changePage(${i})" ${i === currentPage ? 'class="active"' : ""}>${i}</button>`;
	}
	return buttons;
}

function changePage(page) {
	currentPage = page;
	let startIndex = (currentPage - 1) * itemsPerPage;
	let endIndex = startIndex + itemsPerPage;
	const paginatedResults = currentResults.slice(startIndex, endIndex);
	displayResults(paginatedResults);
	paginationContainer.innerHTML = generatePagination(totalPages, currentPage);
	scrollTop();
}

function displayResults(results) {
	if (results.length === 0) {
		noResults.style.display = "block";
		resultsGrid.innerHTML = "";
	} else {
		noResults.style.display = "none";
		resultsGrid.innerHTML = results
			.map((component) => {
				const imageUrl = component.image || "https://placehold.co/600x400/png?text=No+Image";
				const componentFile = component.file ? encodeURIComponent(component.file) : "#";
                console.log(componentFile)
				return `
					<article class="preview-card">
						<div class="preview-card-content">
							<img src="${imageUrl}" alt="${component.name || "Component"}" loading="lazy" />
						</div>
						<div class="preview-card-footer">
							<p>${component.name || "Unnamed Component"}</p>
							<a href="editor-page.html?component=${componentFile}" target="_blank" aria-label="View code for ${component.name}">
								<span>Go to Code</span>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
									<path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"/>
								</svg>
							</a>
						</div>
					</article>
				`;
			})
			.join("");
	}
}

function handleSearch() {
	activeFilters.sort = sortSelect.value;
	const query = searchInput.value.toLowerCase();

	const filtered = allResults.filter((component) => {
		const matchesSearch = component.name.toLowerCase().includes(query);

		const matchesCategory =
			activeFilters.category === "all" ||
			activeFilters.category === component.type ||
			component.category === activeFilters.category;

		return matchesSearch && matchesCategory;
	});

	currentResults = sortResults(filtered);
	totalPages = Math.ceil(currentResults.length / itemsPerPage);

	paginationContainer.innerHTML = generatePagination(totalPages, 1);
	document.querySelector("#searchLength").innerHTML = currentResults.length;

	changePage(1);
}

// Update sort function
function sortResults(results) {
	return results.sort((a, b) => {
		if (activeFilters.sort === "recent") {
			return new Date(b.date) - new Date(a.date);
		}
		return a.name.localeCompare(b.name);
	});
}

// Helpers
function debounce(func, timeout = 300) {
	let timer;
	return function (...args) {
		clearTimeout(timer);
		timer = setTimeout(() => func.apply(this, args), timeout);
	};
}

function scrollTop() {
	window.scrollTo(0, 0);
}

// Initial load
handleSearch();
