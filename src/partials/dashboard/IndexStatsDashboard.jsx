import React, { useState } from "react"

function getClassesByName(data) {
  if (data.is_redundant) {
    return `mt-4 pl-4 border-l-4 border-red-300 dark:border-red-700`
  }

  if (data.accesses.ops === 0) {
    return `mt-4 pl-4 border-l-4 border-amber-300 dark:border-amber-600`
  }

  return `mt-4`
}
async function copyIndex(indexText) {
  await window.utils.copy(indexText)
}
export default (props) => {
  const [ visibleToggles, setVisibleToggles ] = useState([])

  const { data, backAction } = props

  if (!data) {
    return (
      <div className="w-screen max-w-5xl mb-10">
        {/* <BackBanner backAction={backAction} /> */ }
        <div className="col-span-full bg-white dark:bg-table-dark shadow-lg rounded-sm border dark:border-slate-600 border-slate-200 m-10">
          <header className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-leafy-800">
              error: no data found!
            </h2>
          </header>
        </div>
      </div>
    )
  }

  function toggleIdxTable(idx) {
    if (visibleToggles.indexOf(idx) >= 0) {
      const newToggles = visibleToggles.filter((k) => k !== idx)
      setVisibleToggles(newToggles)
    } else {
      setVisibleToggles([ ...visibleToggles, idx ])
    }
  }

  return (
    <div className="col-span-full bg-white dark:bg-table-dark  shadow-lg rounded-md border dark:border-slate-500 border-slate-200 m-10">
      <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-500">
        <h2 className="font-semibold dark:text-leafy-200 text-leafy-900">Index Stats Details</h2>
      </header>
      <ul className="my-2 mx-2 mb-20">
        { Object.keys(data.idx_details).map((ns, idx) => {
          return (
            <li key={ ns } className="flex px-2 mt-4">
              <div className="grow border border-leafy-800 dark:border-leafy-300 rounded-md px-5 text-sm py-2">
                <div
                  className="grow flex justify-between items-center"
                  onClick={ () => toggleIdxTable(idx) }
                >
                  <div className="self-center flex items-start flex-col ">
                    <a
                      className="text-lg font-bold text-slate-800 dark:text-slate-100 dark:hover:text-slate-200 hover:text-slate-900"
                      href="#0"
                    >
                      { ns }
                    </a>
                    <div className="flex items-start">
                      { data.idx_summary.nsRedundantIdx.includes(ns) && (
                        <span className="inline-block mt-4 bg-red-200 dark:bg-red-700 dark:text-red-200 rounded-full px-4 py-1 text-sm font-semibold text-red-700 mr-2 mb-2">
                          Redundant Indexes
                        </span>
                      ) }

                      { data.idx_summary.nsUnusedIdx.includes(ns) && (
                        <span className="inline-block mt-4 bg-amber-200 dark:bg-amber-800 dark:text-amber-300 rounded-full px-4 py-1 text-sm font-semibold text-amber-700 mr-2 mb-2">
                          Unused Indexes
                        </span>
                      ) }

                      { data.idx_summary.collectionWithLargeNoOfIndexes ===
                        ns && (
                          <span className="inline-block mt-4 bg-slate-200 dark:bg-slate-700 dark:text-slate-200 rounded-full px-4 py-1 text-sm font-semibold text-slate-700 mr-2 mb-2">
                            Highest Indexes by count
                          </span>
                        ) }
                    </div>
                  </div>

                  <div className="shrink-0 self-center ml-2">
                    <a
                      className="font-medium text-leafy-800 dark:text-leafy-300 dark:hover:text-leafy-100 hover:text-leafy-800"
                      href="#0"
                    >
                      View Indexes
                      <span className="font-inter hidden sm:inline"> -&gt;</span>
                    </a>
                  </div>
                </div>

                <div className="grow flex-auto">
                  { visibleToggles.includes(idx) && (
                    <div className=" text-slate-50 bg-slate-600 rounded mt-5 border border-slate-300 p-10 ">
                      { Array.isArray(data.idx_details[ ns ]) &&
                        data.idx_details[ ns ].map((d) => {
                          return (
                            <>
                              <pre className={ getClassesByName(d) }>
                                <code>{ JSON.stringify(d, null, 4) }</code>

                              </pre>
                              <button key={d} className="w-full btn  bg-leafy-800 hover:bg-leafy-900 text-white mt-3 text-xs" onClick={ (e) => {
                                e.preventDefault()
                                copyIndex(JSON.stringify(d))
                              } }>
                                <svg key={ d } className="fill-white px-0.5" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                                  <path d="M0 0h24v24H0z" fill="none" />
                                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                                </svg>
                                Copy
                              </button>
                            </>
                            // mongodb+srv://atlasAdmin:atiasAdm1n@poc.js7sc.mongodb.net/test

                          )
                        }) }
                    </div>
                  ) }
                </div>
              </div>
            </li>
          )
        }) }
      </ul>
    </div>
  )
}
