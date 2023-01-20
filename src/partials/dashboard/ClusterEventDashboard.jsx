import React, { useState } from "react"
import FilterButton from "../actions/FilterActionButton"
import DataTable from "react-data-table-component"
import { useEffect } from "react"

const columns = [
  {
    id: "Event",
    name: "Event",
    selector: (row) => row.key || "No Op",
    maxWidth: "500px",
    reorder: true,
    sortable: true,
  },
  {
    id: "Count",
    name: "Count",
    selector: (row) => row.value,
    maxWidth: "120px",
    reorder: true,
    sortable: true,
  },
]

export default function ClusterEventDashboard(props) {
  const { data } = props
  const currentTheme = props.data.isDarkMode ? 'dark' : ''
  const [ displayData, setDisplayData ] = useState([])

  useEffect(() => {
    setDisplayData(data?.data)
  }, [ data?.data ])

  function onSelectFilters(values, type) {
    console.log("Setting Filters", values, type)
    console.log(values)
    const filterdValues = data?.data.filter((element) =>
      values.includes(element.key)
    )
    setDisplayData(filterdValues)
  }

  async function resetSearch() {
    document.dispatchEvent(new CustomEvent("mongolyser:clearfilters"))
    setDisplayData(data?.data)
  }

  return (
    <div className="w-screen mb-10">
      <div className="col-span-full bg-white dark:bg-dark shadow-lg rounded-sm border border-slate-200 m-10">
        <header className="flex item-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-leafy-900 dark:text-leafy-200">
            Cluster Event Analysis
          </h2>
        </header>

        <div className="my-5 px-5 grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          {/* Filter for Collections */ }
          <FilterButton
            title={ "Events" }
            onSelect={ (values) => onSelectFilters(values, "events") }
            options={ Object.keys(data?.data) || [] }
          />

          <button
            title="Reset Search"
            onClick={ (e) => {
              resetSearch()
              e.preventDefault()
            } }
            className="btn bg-leafy-800 hover:bg-leafy-900 text-white"
          >
            <svg
              className="rotate-45 w-4 h-4 fill-white opacity-50 shrink-0"
              viewBox="0 0 16 16"
            >
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
          </button>
        </div>
        <DataTable
          paginationPerPage={ 10 }
          fixedHeader
          highlightOnHover
          pagination
          data={ displayData }
          columns={ columns }
          defaultSortFieldId={ "Count" }
          theme={ currentTheme }
          defaultSortAsc={ false }
          expandableRows
          expandableRowsComponent={ ({ data }) => {
            return (
              <pre className="text-slate-50 bg-slate-600 rounded border border-slate-300 p-10">
                <code className="text-xs">
                  { JSON.stringify(JSON.parse(data.log ? data.log : "{}"), null, 4) }
                </code>
              </pre>
            )
          } }
        />
      </div>
    </div>
  )
}
