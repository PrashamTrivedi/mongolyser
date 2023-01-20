import React from "react"

export default function BackBanner(props) {
  let { backAction } = props
  return (
    <div className="flex dark:bg-dark ml-10 mt-5">
      <button onClick={ backAction } className="font-bold dark:text-leafy-300 text-leafy-900"><span className="font-inter hidden sm:inline"> &lt;- &nbsp;</span>Go Back</button>
    </div>
  )
}
