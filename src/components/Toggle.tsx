// a generic toggle component. this relies on some external state to store
// the enabled/disabled status of the toggle
export const Toggle: React.FC<{
  enabledText: string
  disabledText: string
  state: boolean
  setState: (newState: boolean) => void
}> = ({ enabledText, disabledText, state, setState }) => {
  return (
    <>
      <label className="inline-flex cursor-pointer select-none items-center justify-center rounded-md bg-bg-medium p-1">
        <input
          type="checkbox"
          className="sr-only transition"
          checked={state}
          onChange={() => {
            setState(!state)
          }}
        />
        <span
          className={`flex items-center rounded py-1 px-2 lg:py-2 lg:px-3 text-sm font-medium transition ${
            !state ? 'text-text-light bg-blue-600' : 'text-text-light'
          }`}
        >
          {disabledText}
        </span>
        <span
          className={`flex items-center rounded py-1 px-2 lg:py-2 lg:px-3 text-sm font-medium transition ${
            state ? 'text-text-light bg-amber-600' : 'text-text-light'
          }`}
        >
          {enabledText}
        </span>
      </label>
    </>
  )
}
