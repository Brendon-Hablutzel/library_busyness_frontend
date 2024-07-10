export const Toggle: React.FC<{
  enabledText: string;
  disabledText: string;
  state: boolean;
  setState: (newState: boolean) => void;
}> = ({ enabledText, disabledText, state, setState }) => {
  const handleCheckboxChange = () => {
    setState(!state);
  };

  return (
    <>
      <label className="inline-flex cursor-pointer select-none items-center justify-center rounded-md bg-bg-dark p-1">
        <input
          type="checkbox"
          className="sr-only transition"
          checked={state}
          onChange={handleCheckboxChange}
        />
        <span
          className={`flex items-center rounded py-2 px-3 text-sm font-medium transition ${
            !state ? "text-text-light bg-green-600" : "text-text-light"
          }`}
        >
          {disabledText}
        </span>
        <span
          className={`flex items-center rounded py-2 px-3 text-sm font-medium transition ${
            state ? "text-text-light bg-blue-600" : "text-text-light"
          }`}
        >
          {enabledText}
        </span>
      </label>
    </>
  );
};
