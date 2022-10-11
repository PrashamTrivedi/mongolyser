import React, { useLayoutEffect, useRef, useState } from "react";
import DataTable from 'react-data-table-component';
import Datepicker from "../actions/Datepicker";
import FilterButton from "../actions/FilterActionButton";
import Checkbox from "../utils/Checkbox";
import FilterInput from "../actions/FilterInput";
import FilterSelect from "../actions/FilterSelect";
import { useEffect } from "react";
import { isEqual as _isEqual } from "lodash";


const displaySummaryNames = {
  nCOLLSCAN: "Total Collection Scans",
  nSlowOps: "Total Slow Ops",
  nFind: "Total Find Ops",
  nGetMore: "Total GetMore Ops",
  nAggregate: "Total Aggregate Ops",
  nInsert: "Total Insert Ops",
  nUpdate: "Total Update Ops",
  nCount: "Total Count Ops",
  slowestOp: "Slowest Op"
}

const columns = [
  {
    id: "Operation",
    name: "Operation",
    selector: row => row["Op Type"],
    maxWidth: "200px",
    reorder: true,
  },
  {
    id: "Namespace",
    name: "Namespace",
    selector: row => row.Namespace,
    maxWidth: "200px",
    reorder: true
  },
  {
    id: "Query Pattern",
    name: "Query Pattern",
    selector: row => row["Filter"],
    width: "400px",
    maxWidth: "400px",
    reorder: true
  },
  {
    id: "Duration",
    name: "Duration",
    selector: (row) => row.Duration,
    maxWidth: "200px",
    reorder: true,
    sortable: true,
    sortField: 'Duration',
  },
  {
    id: "Plan Summary",
    name: "Plan Summary",
    selector: row => row["Plan Summary"],
    maxWidth: "200px",
    reorder: true,
    sortable: true,
    sortField: 'Plan Summary'
  },
  {
    id: "Query Targeting",
    name: "Query Targeting",
    selector: row => row.QTR,
    maxWidth: "200px",
    reorder: true
  },
  {
    id: "Sort Stage",
    name: "Sort Stage",
    selector: (row) => row.Sort,
    maxWidth: "200px",
    reorder: true,
  },
  {
    id: "Lookup Stage",
    name: "Lookup Stage",
    selector: (row) => row.Lookup,
    maxWidth: "200px",
    reorder: true,
  },
  {
    id: "Blocking",
    name: "Blocking",
    selector: (row) => row.Blocking,
    maxWidth: "200px",
    reorder: true,
  },
  {
    id: "Timestamp",
    name: "Timestamp",
    selector: row => row.timestamp,
    width: "300px",
    reorder: true,
    sortable: true,
    sortField: 'timestamp',
  }
]


const columnsGrouped = [
  {
    id: "Operation",
    name: "Operation",
    selector: row => row["Op Type"],
    maxWidth: "200px",
    reorder: true,
  },
  {
    id: "Namespace",
    name: "Namespace",
    selector: row => row.Namespace,
    maxWidth: "200px",
    reorder: true
  },
  {
    id: "Count",
    name: "Count",
    selector: row => row.count,
    maxWidth: "200px",
    reorder: true,
    sortable: true,
    sortField: 'count',
  },
  {
    id: "Query Pattern",
    name: "Query Pattern",
    selector: row => row["Filter"],
    width: "400px",
    maxWidth: "400px",
    reorder: true
  },
  {
    id: "Duration",
    name: "Duration",
    selector: (row) => row.Duration,
    maxWidth: "200px",
    reorder: true,
    sortable: true,
    sortField: 'Duration',
  },
  {
    id: "Plan Summary",
    name: "Plan Summary",
    selector: row => row["Plan Summary"],
    maxWidth: "200px",
    reorder: true,
    sortable: true,
    sortField: 'Plan Summary',
  },
  {
    id: "Query Targeting",
    name: "Query Targeting",
    selector: row => row.QTR,
    maxWidth: "200px",
    reorder: true,
  },
  {
    id: "Sort Stage",
    name: "Sort Stage",
    selector: (row) => row.Sort,
    maxWidth: "200px",
    reorder: true,
  },
  {
    id: "Lookup Stage",
    name: "Lookup Stage",
    selector: (row) => row.Lookup,
    maxWidth: "200px",
    reorder: true,
  },
  {
    id: "Blocking",
    name: "Blocking",
    selector: (row) => row.Blocking,
    maxWidth: "200px",
    reorder: true,
  },
  {
    id: "Timestamp",
    name: "Timestamp",
    selector: row => row.timestamp,
    width: "300px",
    reorder: true,
    sortable: true,
    sortField: 'timestamp',
  }
]



export default (props) => {
  // assign the group ref first value since this is our global state
  const groupRef = useRef(true);  
  const [isGrouped, setIsGrouped] = useState(true);
  
  const [tableData, setTableData] = useState(props.data.data.initialData);
  const [tableDataGrouped, setTableDataGrouped] = useState(props.data.data.initialDataGrouped);
  const [paginationData, setPaginationData] = useState({
    count: props.data.data.pagination.count,
    currentPage: props.data.data.pagination.currentPage,
    resetDefault: false
  });

  const [tableSort, setTableSort] = useState({
    "count": -1
  })

  const [isTableLoading, setIsTableLoading] = useState(false);
  const [filters, setFilters] = useState({ namespaces: [], optype: [], slowms: 100 })
  const availableQuerySummary = Object.keys(displaySummaryNames);

  function onSelectFilters(values, type) {
    console.log("Setting Filters", values, type);
    setFilters({
      ...filters,
      [type]: values
    });
  }

  async function getDetails(page = 1, { source, sort, reset }) {
    // Start Loading the table
    setIsTableLoading(true);

    try {
      const sortBy = sort ? sort : tableSort;
      const query = reset ? { namespaces: [], optype: [], slowms: 100 } : filters; 
      const data = await window.engineAPI.queryAnalysisFilter(query, page, sortBy, { grouped: isGrouped });
      console.log("Data Returned", data);

      if (data.status !== 200) {
        alert("Uh Oh! Unable to filter data");
        return;
      }

      if (isGrouped) {
        setTableDataGrouped(data.data);
      } else {
        setTableData(data.data);
      }
      
      setPaginationData({
        count: data.pagination.count,
        currentPage: data.pagination.currentPage,
        resetDefault: source === "filter" ? !paginationData.resetDefault : paginationData.resetDefault
      })

      setTableSort(data.sortOrder);
      setIsTableLoading(false);

    } catch (e) {
      console.error(e);
      alert(e);
    }
  }

  async function getDataByPage(page) {
    const { currentPage } = paginationData;
    
    // Already on current page return
    if (currentPage === page) {
      return;
    }

    getDetails(page, { source: "pagination" });
  }

  async function getDataBySorting(col, order) {
    // create the order the way we expect it to work
    const sortOrder = { [col.sortField]: order === "desc" ? -1 : 1 }

    // log it
    console.log(sortOrder);

    // return if order is same
    if (_isEqual(sortOrder, tableSort)) {
      console.log("Already on same order");
      return;
    }

    getDetails(1, { source: "filter", sort: sortOrder })
  }

  async function resetSearch() {
    setFilters({ namespaces: [], optype: [], slowms: 100 });
    document.dispatchEvent(new CustomEvent('mongolyser:clearfilters'));
    getDetails(1, { source: "filter", reset: true });
  }


  useEffect(() => {
    // Only run the function if filter is different from default state
    if (filters.namespaces.length <= 0 && filters.optype.length <= 0 && filters.slowms === 100 ) {
      return;
    }

    getDetails(1, { source: "filter" });
  }, [filters])

  useEffect(() => {
    if (groupRef.current === isGrouped) {
      return;
    }

    groupRef.current = isGrouped;
    getDetails(1, { source: 'filter' });
  }, [isGrouped]);

  return (
    <div className="w-screen mb-10">
      {/* Table section */}
      <div className="col-span-full bg-white shadow-lg rounded-sm border border-slate-200 m-10">
        <header className="flex item-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-indigo-800">Query Analysis Details</h2>
          
          {/* Grou Checkbox */}
          <div className="flex items-center">
            <span className="mr-4 font-semibold text-indigo-800">Group by Query</span>
            <Checkbox checked={isGrouped} setChecked={() => {
              setIsGrouped(!isGrouped);
            }} />
          </div>
        </header>

        <div className="my-5 px-5 grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">

          {/* Filter for Collections */}
          <FilterButton title={"Collections"} onSelect={values => onSelectFilters(values, "namespaces")} options={props?.data?.data?.filters?.namespaces || []} />
          {/* Filter for Operations */}
          <FilterButton title={"Operation"} onSelect={values => onSelectFilters(values, "optype")} options={[
            "Find",
            "Count",
            "Aggregate",
            "Insert",
            "Update",
            "getMore"
          ]} />
          
          {/* TODO LATER */}
          {/* <Datepicker start={props?.data?.data?.filters?.timeRange?.start} end={props?.data?.data?.filters?.timeRange?.end} /> */}

          {/* Slow MS filter box */}
          <FilterInput 
            title="Slow MS" 
            value={100} 
            onSelect={value => onSelectFilters(value, "slowms")} 
            validate={val => val >= 100}
            validateErrorMessage={"Please enter a value greater than 100"}
            type="number" />

          {/* Submit Button */}
          <button title="Reset Search" onClick={e => {
            resetSearch();
            e.preventDefault();
          }} className="btn bg-indigo-500 hover:bg-indigo-600 text-white">
            <svg className="rotate-45 w-4 h-4 fill-white opacity-50 shrink-0" viewBox="0 0 16 16">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
          </button>            
        </div>

        <DataTable
          conditionalRowStyles={[
            {  
              when: row => row["Plan Summary"] === "COLLSCAN",
              style: row => ({ backgroundColor: "#bec4fe" })
            }
          ]}
          paginationPerPage={20}
          fixedHeader
          highlightOnHover
          progressPending={isTableLoading}
          data={( isGrouped ? tableDataGrouped : tableData) || []}
          columns={ isGrouped ? columnsGrouped : columns }
          paginationServerOptions={{
            persistSelectedOnSort: false
          }}
          defaultSortAsc={false}
          defaultSortFieldId={isGrouped ? "Count" : "Duration"}
          onSort={(col, direction) => { getDataBySorting(col, direction) }}
          sortServer
          paginationRowsPerPageOptions={[20]}
          onChangePage={(page) => { getDataByPage(page) }}
          paginationTotalRows={ paginationData.count }
          pagination
          paginationServer
          paginationResetDefaultPage={paginationData.resetDefault}
          expandableRows
          expandableRowsComponent={({ data }) => {
            return (
              <pre className="text-slate-50 bg-slate-600 rounded border border-slate-300 p-10">
                <code className="text-xs">
                  {JSON.stringify(JSON.parse(data.Log), null, 4)}
                </code>
              </pre>
            )
          }}
        />
      </div>
    </div>
  );
};
