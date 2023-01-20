import React, { useState } from 'react'
import FilterButton from "../actions/FilterActionButton"
import DataTable from 'react-data-table-component'
import { useEffect } from 'react'
import DisplayNameMappers from "../../misc/DisplayNameMappers"

const columns = [
    {
        id: "Namespace",
        name: "Namespace",
        selector: row => row._id || "No Op",
        maxWidth: "500px",
        reorder: true,
        sortable: true,
    },
    {
        id: "Insert",
        name: "Insert",
        selector: row => row.i ? parseInt(row.i) : 0,
        maxWidth: "120px",
        reorder: true,
        sortable: true,
    },
    {
        id: "Update",
        name: "Update",
        selector: (row) => row.u ? parseInt(row.u) : 0,
        maxWidth: "120px",
        reorder: true,
        sortable: true,
    },
    {
        id: "No Ops",
        name: "No Ops",
        selector: row => row.n ? parseInt(row.n) : 0,
        maxWidth: "120px",
        reorder: true,
        sortable: true,
        sortField: 'No Ops'
    },
    {
        id: "Delete",
        name: "Delete",
        selector: row => row.d ? parseInt(row.d) : 0,
        maxWidth: "120px",
        reorder: true,
        sortable: true,
        sortField: 'Delete'
    },
    {
        id: "Command",
        name: "Command",
        selector: (row) => row.c ? parseInt(row.c) : 0,
        maxWidth: "120px",
        reorder: true,
        sortable: true,
        sortField: "Command"
    }
]
const largest_oplog_column = [
    {
        id: "Operation",
        name: "Operation",
        selector: row => DisplayNameMappers[ row._id ] || "No Op",
        maxWidth: "200px"
    },
    {
        id: "Max Size",
        name: "Max Size",
        selector: row => row.maxSize ? parseInt(row.maxSize) : 0,
        maxWidth: "400px",
        reorder: true,
        sortable: true,
    }
]

export default function WorkLoadDashboard(props) {
    const { data } = props
    const [ isTableLoading, setIsTableLoading ] = useState(false)
    const [ displayData, setDisplayData ] = useState([])

    const { largest_oplog, nameSpaces, display_oplog_count_by_optype } = data

    const currentTheme = props.data.isDarkMode ? 'dark' : ''
    useEffect(() => {
        setDisplayData(display_oplog_count_by_optype)
    }, [ display_oplog_count_by_optype ])

    function onSelectFilters(values, type) {
        console.log("Setting Filters", values, type)
        console.log(values)
        const filterdValues = display_oplog_count_by_optype.filter((element) => values.includes(element._id === "" ? "No Op" : element._id))
        setDisplayData(filterdValues)
    }

    async function resetSearch() {
        document.dispatchEvent(new CustomEvent('mongolyser:clearfilters'))
        setDisplayData(display_oplog_count_by_optype)
    }

    return (
        <div className="w-screen mb-10">
            <div className="col-span-full bg-white dark:bg-dark shadow-lg rounded-sm border border-slate-200 dark:border-slate-800 m-10">
                <header className="flex item-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="font-semibold text-leafy-900 dark:text-leafy-200">WriteLoad Analysis</h2>
                </header>

                <div className="my-5 px-5 grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">

                    {/* Filter for Collections */ }
                    <FilterButton title={ "Namespace" } onSelect={ values => onSelectFilters(values, "namespaces") } options={ nameSpaces || [] } />

                    <button title="Reset Search" onClick={ e => {
                        resetSearch()
                        e.preventDefault()
                    } } className="btn bg-leafy-800 hover:bg-leafy-900 text-white">
                        <svg className="w-4 h-4 fill-white " viewBox="0 0 16 16">
                            <path xmlns="http://www.w3.org/2000/svg" d="M314.25,85.4h-227c-21.3,0-38.6,17.3-38.6,38.6v325.7c0,21.3,17.3,38.6,38.6,38.6h227c21.3,0,38.6-17.3,38.6-38.6V124    C352.75,102.7,335.45,85.4,314.25,85.4z M325.75,449.6c0,6.4-5.2,11.6-11.6,11.6h-227c-6.4,0-11.6-5.2-11.6-11.6V124    c0-6.4,5.2-11.6,11.6-11.6h227c6.4,0,11.6,5.2,11.6,11.6V449.6z" />
                            <path xmlns="http://www.w3.org/2000/svg" d="M401.05,0h-227c-21.3,0-38.6,17.3-38.6,38.6c0,7.5,6,13.5,13.5,13.5s13.5-6,13.5-13.5c0-6.4,5.2-11.6,11.6-11.6h227    c6.4,0,11.6,5.2,11.6,11.6v325.7c0,6.4-5.2,11.6-11.6,11.6c-7.5,0-13.5,6-13.5,13.5s6,13.5,13.5,13.5c21.3,0,38.6-17.3,38.6-38.6    V38.6C439.65,17.3,422.35,0,401.05,0z" />
                        </svg>
                    </button>
                </div>
                <DataTable
                    conditionalRowStyles={ [
                        {
                            when: row => (row[ "_id" ].split(".")[ 0 ] === "local" || row[ "_id" ].split(".")[ 0 ] === "config" || row[ "_id" ].split(".")[ 0 ] === "admin" || row[ "_id" ] === ""),
                            classNames: [ 'specialCell' ]
                        }
                    ] }
                    paginationPerPage={ 5 }
                    fixedHeader
                    highlightOnHover
                    progressPending={ isTableLoading }
                    pagination
                    theme={ currentTheme }
                    data={ displayData }
                    columns={ columns }
                    defaultSortFieldId={ "Namespace" }
                    defaultSortAsc={ true }
                />
            </div>

            <div className="col-span-full bg-white dark:bg-dark shadow-lg rounded-sm border border-slate-200 dark:border-slate-700 m-10">
                <header className="flex item-center justify-between px-5 py-4 border-b border-slate-100  dark:border-slate-600">
                    <h2 className="font-semibold text-leafy-900 dark:text-leafy-300">Large OpLogs by Size(Bytes)</h2>
                </header>

                <DataTable
                    data={ largest_oplog }
                    columns={ largest_oplog_column }
                    expandableRows
                    theme='default'
                    defaultSortFieldId={ "Max Size" }
                    defaultSortAsc={ false }
                    expandableRowsComponent={ ({ data }) => {
                        return (
                            <pre className="text-slate-50 bg-slate-600 rounded border border-slate-300 p-10">
                                <code className="text-xs">
                                    { JSON.stringify(data.originalDoc, null, 4) }
                                </code>
                            </pre>
                        )
                    } }
                />
            </div>
        </div>
    )
}