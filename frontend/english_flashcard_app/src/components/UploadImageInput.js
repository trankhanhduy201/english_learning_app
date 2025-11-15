import { memo, useCallback, useRef, useState } from "react";
import UploadImage from "./UploadImage";

const UploadImageInput = memo(({ name, defaultImage = null }) => {
	const [ preview, setPreview ] = useState(null);
	const inputRef = useRef(null);

	const onChangeImage = (e) => {
		const file = e.target.files[0];
		if (file) {
			// You can use FileReader instead of URL.createObjectURL if needed
			const imageUrl = URL.createObjectURL(file);
			console.log(file, imageUrl);
			setPreview(imageUrl);
		}
	}

	const onRemoveImage = useCallback((e) => {
		e.preventDefault();
		inputRef.current.value = '';
		URL.revokeObjectURL(preview);
		setPreview(null);
	});

	return (
		<>
			{defaultImage ? (
				<div className="mt-3">
					<UploadImage src={defaultImage} onRemove={onRemoveImage} />
				</div>
			) : (
				<>
					<input 
						ref={inputRef}
						type="file" 
						className="form-control" 
						name={name}
						onChange={onChangeImage} 
					/>
						{preview && (
							<div className="mt-3">
								<UploadImage src={preview} onRemove={onRemoveImage} />
							</div>
						)}
				</>
			)}
		</>
	)
});

export default UploadImageInput;