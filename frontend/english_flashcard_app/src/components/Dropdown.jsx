const Dropdown = ({
  name,
  value,
  defaultValue,
  options = [],
  onChange,
  className = "form-control",
  disabled = false,
  ...props
}) => {
  return (
    <select
      name={name}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      className={className}
      disabled={disabled}
      {...props}
    >
      {options.map((item) => (
        <option key={name + item.key} value={item.key}>
          {item.text}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;
