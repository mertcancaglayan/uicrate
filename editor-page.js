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

	function updatePreview() {
		const html = htmlEditor.getValue();
		const css = `<style>${cssEditor.getValue()}</style>`;
		const js = `<script>${jsEditor.getValue()}<\/script>`;
		document.getElementById("preview").srcdoc = `${css}${html}${js}`;
	}

	htmlEditor.on("change", updatePreview);
	cssEditor.on("change", updatePreview);
	jsEditor.on("change", updatePreview);
	updatePreview();

	window.addEventListener("DOMContentLoaded", () => {
		const urlParams = new URLSearchParams(window.location.search);
		const componentFile = urlParams.get("component");

		if (!componentFile) {
			console.error("Component file is not specified in the URL.");
			return;
		}

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
	});

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
});
