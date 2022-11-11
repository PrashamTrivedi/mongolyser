import "./index.css";

export default ({ checked, setChecked, ...props }) => {
  return (
    <div className="flex items-center justify-center">
      <label htmlFor="toggleB" className="flex items-center cursor-pointer">
        {/* <!-- toggle --> */}
        <div className="relative">
          {/* <!-- input --> */}
          <input onChange={e => setChecked()} type="checkbox" id="toggleB" className="sr-only" checked={checked} />
          {/* <!-- line --> */}
          <div className="block bg-leafy-100 w-14 h-8 rounded-full"></div>
          {/* <!-- dot --> */}
          <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
        </div>
      </label>
    </div>
  )
}