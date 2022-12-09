import React from 'react'
import DataTable from 'react-data-table-component'

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
    const currentTheme = props.data.isDarkMode ? 'dark' : ''
    return (
        <div className="w-screen mb-10 dark:bg-black">
            <div className="col-span-full bg-white dark:bg-black shadow-lg rounded-md border dark:border-slate-700 border-slate-200 m-10">
                <header className="flex item-center justify-between px-5 py-4 border-b dark:border-slate-800 border-slate-100">
                    <h2 className="font-semibold text-leafy-900 dark:text-leafy-100">Connection List</h2>
                </header>

                <DataTable
                    conditionalRowStyles={ [
                        {
                            when: row => row.ip === "Internal",
                            classNames: [ 'specialCell' ]
                        }
                    ] }
                    className="connectionTable"
                    paginationPerPage={ 10 }
                    fixedHeader
                    highlightOnHover
                    pagination
                    theme={currentTheme}
                    data={ connectionList }
                    columns={ columns }
                    defaultSortFieldId={ "Current Connections" }
                    defaultSortAsc={ false }
                />
            </div>
        </div>
    )
}
