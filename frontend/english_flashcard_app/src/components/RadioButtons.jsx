import { memo } from "react";

const RadioButtons = memo(({ name, options, selectedOption, onChange = null }) => {
	return (
		<>
			{options.map((option) => (
				<div key={`FormCheck_${option.key}`} className="form-check-inline">
					<input
						className="form-check-input"
						name={name}
						type="radio"
						id={`${name}_${option.key}`}
						defaultChecked={selectedOption === option.key}
						value={option.key}
						onChange={onChange}
					/>
					<label className="form-check-label ms-1" htmlFor={`${name}_${option.key}`}>
						{option.text}
					</label>
				</div>
			))}
		</>
	)
});

export default RadioButtons;