import "./index.css";

export default ({ checked, setChecked, ...props }) => {
  return (
    <div class="flex items-center justify-center">
      <label for="toggleB" class="flex items-center cursor-pointer">
        {/* <!-- toggle --> */}
        <div class="relative">
          {/* <!-- input --> */}
          <input onChange={e => setChecked()} type="checkbox" id="toggleB" class="sr-only" checked={checked} />
          {/* <!-- line --> */}
          <div class="block bg-indigo-100 w-14 h-8 rounded-full"></div>
          {/* <!-- dot --> */}
          <div class="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
        </div>
      </label>
    </div>
  )
}