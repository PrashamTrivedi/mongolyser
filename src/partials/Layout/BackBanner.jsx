import React from "react";

export default function BackBanner(props) {
  let {backAction} = props;
  return (
    <div className="flex ml-10 mt-5">
        <button onClick={backAction} className="font-bold text-leafy-900"><span className="font-inter hidden sm:inline"> &lt;- &nbsp;</span>Go Back</button>
    </div>
  );
}
