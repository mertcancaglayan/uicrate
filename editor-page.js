document.addEventListener("DOMContentLoaded", function () {
	const htmlEditor = CodeMirror.fromTextArea(document.getElementById("htmlEditor"), {
		lineNumbers: true,
		mode: "htmlmixed",
		theme: "dracula",
		value: "<h1>Hello World!</h1>\n<p>Start coding...</p>",
	});

	const cssEditor = CodeMirror.fromTextArea(document.getElementById("cssEditor"), {
		lineNumbers: true,
		mode: "css",
		theme: "dracula",
		value: "body {\n  background: #f0f0f0;\n}",
	});

	const jsEditor = CodeMirror.fromTextArea(document.getElementById("jsEditor"), {
		lineNumbers: true,
		mode: "javascript",
		theme: "dracula",
		value: 'console.log("Hello from JS!");',
	});

	let debounceTimer;
	function updatePreview() {
		const html = htmlEditor.getValue();
		const css = `<style>${cssEditor.getValue()}</style>`;
		const jsCode = jsEditor.getValue().replace(/<\/script>/gi, "<\\/script>");

		const antiNavigationScript = `
			<script>
				document.querySelectorAll('a').forEach(link => {
					link.addEventListener('click', function(event) {
						event.preventDefault();
					});
				});
			<\/script>
		`;

		const iframe = document.getElementById("preview");
		iframe.srcdoc = `${css}${html}${antiNavigationScript}<script>${jsCode}</script>`;
	}

	function debounceUpdatePreview() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(updatePreview, 300);
	}

	htmlEditor.on("change", debounceUpdatePreview);
	cssEditor.on("change", debounceUpdatePreview);
	jsEditor.on("change", debounceUpdatePreview);

	updatePreview();

	const urlParams = new URLSearchParams(window.location.search);
	const componentFile = urlParams.get("component");

	if (componentFile) {
		const filePath = "components/" + componentFile;

		fetch(filePath)
			.then((response) => {
				if (!response.ok) throw new Error(`Failed to load ${componentFile}`);
				return response.text();
			})
			.then((result) => {
				const componentCode = JSON.parse(result);
				htmlEditor.setValue(componentCode.html || "<!-- No HTML content -->");
				cssEditor.setValue(componentCode.style || "/* No CSS found */");
				jsEditor.setValue(componentCode.script || "// No JavaScript found");
				updatePreview();
			})
			.catch((error) => {
				console.error("Error loading component:", error);
				htmlEditor.setValue(`Error: ${error.message}`);
				cssEditor.setValue("/* Failed to load CSS */");
				jsEditor.setValue("// Failed to load JavaScript");
			});
	} else {
		console.warn("Component file is not specified in the URL.");
	}

	Split(["#split-0", "#split-1", "#split-2"], {
		sizes: [33, 33, 33],
		minSize: 100,
		gutterSize: 15,
		cursor: "ew-resize",
	});

	Split(["#editor-container", "#preview-container"], {
		direction: "vertical",
		sizes: [30, 70],
		minSize: [100, 300],
		gutterSize: 10,
		cursor: "ns-resize",
	});

	window.copyToClipboard = function (editorId) {
		let editor;
		if (editorId === "htmlEditor") editor = htmlEditor;
		else if (editorId === "cssEditor") editor = cssEditor;
		else if (editorId === "jsEditor") editor = jsEditor;
		else return;

		navigator.clipboard
			.writeText(editor.getValue())
			.then(() => {
				showCopyToast("Code copied to clipboard!");
			})
			.catch((err) => {
				console.error("Failed to copy: ", err);
			});
	};

	function showCopyToast(message) {
		const toast = document.createElement("div");
		toast.textContent = message;
		toast.style.position = "fixed";
		toast.style.top = "20px";
		toast.style.left = "20px";
		toast.style.padding = "10px 20px";
		toast.style.background = "#333";
		toast.style.color = "#fff";
		toast.style.borderRadius = "10px";
		toast.style.opacity = "0.9";
		toast.style.zIndex = "9999";
		document.body.appendChild(toast);
		setTimeout(() => {
			toast.remove();
		}, 2000);
	}
});
