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
