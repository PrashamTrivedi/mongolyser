import React from 'react'
import DataTable from 'react-data-table-component';

const columns = [
    {
        id: "Connection Ip",
        name: "Event",
        selector: row => row.ip,
        maxWidth: "300px",
        reorder: true,
        sortable: true,
    },
    {
        id: "Current Connections",
        name: "Current Connections",
        selector: row => row.count,
        maxWidth: "200px",
        reorder: true,
        sortable: true,
    }
]

export default function ConnectionDashboard(props) {
    const { connectionList } = props.data
    return (
        <div className="w-screen mb-10">
            <div className="col-span-full bg-white shadow-lg rounded-sm border border-slate-200 m-10">
                <header className="flex item-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-leafy-900">Connection List</h2>
                </header>

                <DataTable
                    conditionalRowStyles={[
                        {
                            when: row => row.ip === "Internal",
                            style: row => ({ backgroundColor: "#FFCDC7" })
                        }
                    ]}
                    paginationPerPage={10}
                    fixedHeader
                    highlightOnHover
                    pagination
                    data={connectionList}
                    columns={columns}
                    defaultSortFieldId={"Current Connections"}
                    defaultSortAsc={false}
                />
            </div>
        </div>
    )
}
