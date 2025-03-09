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

function displayResults(components) {
	if (components.length === 0) {
		noResults.style.display = "block";
		resultsGrid.innerHTML = "";
	} else {
		noResults.style.display = "none";
		resultsGrid.innerHTML = components
			.map(({ image, name, file }) => {
				const imageUrl = image || "https://placehold.co/600x400/png?text=No+Image";
				const componentFile = file ? encodeURIComponent(file) : "#";
				return `
          <article class="preview-card">
            <div class="preview-card-content">
              <img src="${imageUrl}" onerror="this.onerror=null; this.src='https://placehold.co/600x400/png?text=No+Image';" alt="${
					name || "Component"
				}" loading="lazy" />
            </div>
            <div class="preview-card-footer">
              <p>${name || "Unnamed Component"}</p>
              <a href="editor-page.html?component=${componentFile}" target="_blank" aria-label="View code for ${name}">
                <span>Go to Code</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                  <path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5-34.7 22-39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"/>
                </svg>
              </a>
            </div>
          </article>
        `;
			})
			.join("");
	}
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
