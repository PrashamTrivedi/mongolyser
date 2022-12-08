import React from "react";
import DisplayNameMappers from "../../misc/DisplayNameMappers"

export default function StatSummary(props) {

  const { dataList, name, noOfBoxes } = props;
  let width = " w-1/5"
  if(noOfBoxes === 2) {
    width = " w-1/3"
  } else if (noOfBoxes === 3) {
    width = " w-1/4"
  } else {
    width = " w-1/5"
  }
  const availableSummaries = Object.keys(DisplayNameMappers);
  return (
    <div className="col-span-full bg-white dark:bg-black shadow-lg rounded-md border border-slate-200 dark:border-slate-600  m-10">
      <header className="px-5 py-4 border-b-2 dark:border-slate-800 border-slate-100">
        <h2 className="font-semibold text-leafy-900 dark:text-leafy-200">{name}</h2>
      </header>
      <div className="flex items-start justify-around flex-wrap">
        {Object.keys(dataList).map((s) => {
          if (availableSummaries.indexOf(s) < 0) {
            return null;
          }
          return (
            <div
              key={DisplayNameMappers[s]}
              className={"border border-slate-200 bg-white dark:bg-black rounded-md overflow-hidden shadow-lg dark:border-slate-600 m-5" + width}
            >
              <div className="px-6 py-4">
                <div className="text-m dark:text-leafy-200 mb-2">{DisplayNameMappers[s]}</div>
                <p className="text-2xl font-bold leading-7 dark:text-leafy-100 text-leafy-900">
                  {dataList[s]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
