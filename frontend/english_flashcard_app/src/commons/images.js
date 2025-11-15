export const parseImageData = async (file) => {
	if (!file instanceof File) {
		return null;
	}

	const base64 = await blobToBase64(file);
	return {
		name: file.name,
		type: file.type,
		size: file.size,
		base64: base64,
	}
}

export const blobToBase64 = async (blob) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}
	