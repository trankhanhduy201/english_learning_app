import { memo } from "react";

const UploadImage = memo(({ src, height=200, width=200, onRemove=null }) => {
	return (
		<>
			<div className="position-relative d-inline-block">
				<img
					className="img-fluid rounded border"
					src={src}
					alt="Uploaded image"
					style={{ maxWidth: `${width}px`, maxHeight: `${height}px` }}
				/>
				<div className="position-absolute" style={{ top: "-10px", right: "-10px" }}>
					<a className="mt-1 text-black" href="#" onClick={onRemove}>
						<i className="bi bi-x-circle-fill me-1"></i>
					</a>
				</div>
			</div>
		</>
	)
});

export default UploadImage;