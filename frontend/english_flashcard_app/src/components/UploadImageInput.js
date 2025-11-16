import { memo, useCallback, useEffect, useRef, useState } from "react";
import UploadImage from "./UploadImage";
import { API_BASE_URL } from "../configs/apiConfig";

const UploadImageInput = memo(({ name, imageUrl = null }) => {
	const [ preview, setPreview ] = useState(null);
	const [ defaultImage, setDefaultImage ] = useState();
	const inputRef = useRef(null);

	const onChangeImage = (e) => {
		const file = e.target.files[0];
		if (file) {
			// You can use FileReader instead of URL.createObjectURL if needed
			const blobImageUrl = URL.createObjectURL(file);
			setPreview(blobImageUrl);
		}
	}

	const onRemoveImage = useCallback((e) => {
		e.preventDefault();
		if (inputRef.current) {
			inputRef.current.value = '';
		}
		URL.revokeObjectURL(preview);
		setPreview(null);
		setDefaultImage(null);
	}, [preview, inputRef]);

	useEffect(() => {
		if (imageUrl) {
			setDefaultImage(API_BASE_URL + imageUrl);
		}
	}, [imageUrl]);

	return (
		<>
			{defaultImage ? (
				<div className="d-block">
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