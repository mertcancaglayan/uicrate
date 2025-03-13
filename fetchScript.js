export async function fetchComponent(componentFile) {
	try {
		const response = await fetch("/components/" + componentFile);
		if (!response.ok) throw new Error(`Failed to load ${componentFile}`);
		const componentCode = await response.json();
		return componentCode;
	} catch (error) {
		return false;
	}
}
