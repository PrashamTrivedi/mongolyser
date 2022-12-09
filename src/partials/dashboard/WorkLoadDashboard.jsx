import React, { useState } from 'react'
import FilterButton from "../actions/FilterActionButton";
import DataTable from 'react-data-table-component';
import { useEffect } from 'react';
import DisplayNameMappers from "../../misc/DisplayNameMappers";

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
        selector: row => DisplayNameMappers[row._id] || "No Op",
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
    const { data } = props;
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [displayData, setDisplayData] = useState([]);

    const { largest_oplog, nameSpaces, display_oplog_count_by_optype } = data;

    const currentTheme = props.data.isDarkMode ? 'dark' : ''
    useEffect(() => {
        setDisplayData(display_oplog_count_by_optype);
    }, [display_oplog_count_by_optype])

    function onSelectFilters(values, type) {
        console.log("Setting Filters", values, type);
        console.log(values);
        const filterdValues = display_oplog_count_by_optype.filter((element) => values.includes(element._id === "" ? "No Op" : element._id));
        setDisplayData(filterdValues);
    }

    async function resetSearch() {
        document.dispatchEvent(new CustomEvent('mongolyser:clearfilters'));
        setDisplayData(display_oplog_count_by_optype);
    }

    return (
        <div className="w-screen mb-10">
            <div className="col-span-full bg-white shadow-lg rounded-sm border border-slate-200 m-10">
                <header className="flex item-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-leafy-900">WriteLoad Analysis</h2>
                </header>

                <div className="my-5 px-5 grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">

                    {/* Filter for Collections */}
                    <FilterButton title={"Namespace"} onSelect={values => onSelectFilters(values, "namespaces")} options={nameSpaces || []} />

                    <button title="Reset Search" onClick={e => {
                        resetSearch();
                        e.preventDefault();
                    }} className="btn bg-leafy-800 hover:bg-leafy-900 text-white">
                        <svg className="rotate-45 w-4 h-4 fill-white opacity-50 shrink-0" viewBox="0 0 16 16">
                            <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                        </svg>
                    </button>
                </div>
                <DataTable
                    conditionalRowStyles={[
                        {
                            when: row => (row["_id"].split(".")[0] === "local" || row["_id"].split(".")[0] === "config" || row["_id"].split(".")[0] === "admin" || row["_id"] === ""),
                            classNames: [ 'specialCell' ]
                        }
                    ]}
                    paginationPerPage={5}
                    fixedHeader
                    highlightOnHover
                    progressPending={isTableLoading}
                    pagination
                    theme={currentTheme}
                    data={displayData}
                    columns={columns}
                    defaultSortFieldId={"Namespace"}
                    defaultSortAsc={true}
                />
            </div>

            <div className="col-span-full bg-white shadow-lg rounded-sm border border-slate-200 m-10">
                <header className="flex item-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-leafy-900">Large OpLogs by Size(Bytes)</h2>
                </header>

                <DataTable
                    data={largest_oplog}
                    columns={largest_oplog_column}
                    expandableRows
                    theme='default'
                    defaultSortFieldId={"Max Size"}
                    defaultSortAsc={false}
                    expandableRowsComponent={({ data }) => {
                        return (
                            <pre className="text-slate-50 bg-slate-600 rounded border border-slate-300 p-10">
                                <code className="text-xs">
                                    {JSON.stringify(data.originalDoc, null, 4)}
                                </code>
                            </pre>
                        )
                    }}
                />
            </div>
        </div>
    )
}