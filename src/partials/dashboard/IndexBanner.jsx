import React, { useEffect, useState } from "react"
import Select from "react-select"
import heroImage from "../../images/hero.png"
import Checkbox from "../utils/Checkbox/index.jsx"

// TODO: Discuss should we have a central place to list all analysis
function IndexBanner(props) {
  const actions = [
    {
      value: "Index Analysis",
      label: "Index Analysis",
      type: "cluster",
      alertMessage: "",
      infoMessage: "Be advised of dhandles in case of large volume of collections.",
    },
    // { value: "Oplog Analysis", label: "Oplog Analysis", type: "cluster" },
    {
      value: "Query Analysis",
      label: "Query Analysis (Log Analysis)",
      type: "log",
      alertMessage: "",
      infoMessage: ".log files only. Works for MongoDB v4.4+. Larger the file; more the time needed for processing.",
    },
    {
      value: "Connection Analysis",
      label: "Connection Analysis",
      type: "cluster",
      alertMessage: "",
      infoMessage: "",
    },
    {
      value: "Write Load Analysis",
      label: "Write Load Analysis (Oplog Analysis)",
      type: "cluster",
      alertMessage: "This is an expensive process and will run COLLSCAN on Oplog.rs. Please use with Caution",
      infoMessage: "For sharded clusters, use the connection string of the Shard (replica set) being diagnosed.",
    },
    {
      value: "Cluster Event Analysis",
      label: "Cluster Event Analysis",
      type: "log",
      alertMessage: "",
      infoMessage: ".log files only. Works for MongoDB v4.4+.",
    },
  ]
  // { value: "Sharding Analysis", label: "Sharding Analysis", type: "cluster" },
  // {
  //   value: "General Cluster Health",
  //   label: "General Cluster Health",
  //   type: "cluster",
  // },
  // {
  //   value: "Cluster Event Analysis",
  //   label: "Cluster Event Analysis",
  //   type: "log",
  // },
  // {
  //   value: "Query Pattern Analysis",
  //   label: "Query Pattern Analysis",
  //   type: "log",
  // },
  // { value: "Connection Analysis", label: "Connection Analysis", type: "log" },
  // {
  //   value: "Sharding Analysis",
  //   label: "Sharding Analysis",
  //   type: "cluster",
  //   alertMessage: "",
  //   infoMessage: "",
  // },

  const [ actionSelected, setActionSelected ] = useState({})
  const [ connectionUrl, setConnectionUrl ] = useState("")
  const [ loader, setLoader ] = useState(false)

  useEffect(() => {
    if (props?.data?.filePath) {
      setConnectionUrl(props.data.filePath)
    }
    return () => {
      setLoader(false)
    }
  }, [ props?.data?.filePath ])

  function toggleLoader() {
    setLoader(!loader)
  }


  async function toggleDarkMode() {
    await window.darkMode.toggle()
  }

  async function resetThemeToSystem() {
    await window.darkMode.resetToSystemTheme()
  }


  async function onAction() {
    toggleLoader()
    const ret = await props.onAction({
      value: actionSelected.value,
      type: actionSelected.type,
      path: connectionUrl,
    })
    if (!ret) {
      setLoader(false)
    }
  }

  return (
    <div className="w-full flex items-center bg-white dark:bg-dark">
      <div className="w-1/2 bg-leafy-900 h-full flex items-center">
        <img src={ heroImage } />
      </div>
      <div className="relative pl-6 md:pl-28 rounded-sm w-1/2">
        <div className="max-w-sm w-5/6">
          {/* Background illustration */ }
          <div
            className="absolute right-0 top-0 -mt-4 mr-16 pointer-events-none hidden xl:block"
            aria-hidden="true"
          ></div>

          {/* Content */ }
          <div className="relative">

            <h1 className="text-2xl md:text-3xl dark:text-slate-200 text-slate-800 font-bold mb-1">
              Hello 👋!
            </h1>
            <p className=" dark:text-slate-200">Please select the analysis you want to do:</p>
          </div>

          <Select
            className="analyzer-container"
            classNamePrefix="analyzer"
            placeholder="Select Analysis Type"
            value={ actionSelected }
            options={ actions }
            onChange={ (value) => setActionSelected(value) }
          />

          { actionSelected.type === "cluster" && (
            <div className="mt-5">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label inline-block mb-2 text-gray-700  dark:text-slate-100"
              >
                Enter Cluster Link
              </label>
              <input
                id="exampleFormControlInput1"
                value={ connectionUrl }
                onChange={ (e) => setConnectionUrl(e.target.value) }
                placeholder="mongodb+srv://your-cluster-link/?rsname"
                className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-dark dark:bg-dark bg-white bg-clip-padding border border-solid border-leafy-600 rounded transition ease-in-out m-0 focus:border-leafy-600 focus:bg-white focus:border-leafy-600 focus:outline-none"
              />
              { actionSelected.infoMessage !== "" && (
                <p className=" text-sm text-slate-700 dark:text-slate-100" id="file_input_help">
                  { actionSelected.infoMessage }
                </p>
              ) }
              { actionSelected.alertMessage !== "" && (
                <p className=" bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2" role={ "alert" }>
                  { actionSelected.alertMessage }
                </p>
              ) }
            </div>
          ) }

          { actionSelected.type === "log" && (
            <>
              <label
                className="mt-4 block text-sm font-medium dark:text-slate-100 text-slate-600"
                htmlFor="file_input"
              >
                Upload file
              </label>
              <input
                className="block p-2 w-full text-sm text-grey file:rounded-full file:border-0 file:py-2 file:px-4 file:dark:text-slate-100 file:dark:bg-leafy-800 hover:file:dark:bg-leafy-700 file:bg-leafy-100 file:text-leafy-700 hover:file:bg-leafy-200 bg-white dark:bg-dark dark:text-slate-100 rounded-lg border  border-leafy-300 cursor-pointer focus:outline-none"
                id="file_input"
                type="file"
                onChange={ (e) => {
                  props.onAction({ value: "File Picker", payload: e })
                } }
                accept=".log"
              />
              { actionSelected.infoMessage !== "" && (
                <p className=" text-sm text-slate-700 dark:text-slate-300" id="file_input_help">
                  { actionSelected.infoMessage }
                </p>
              ) }
              { actionSelected.alertMessage !== "" && (
                <p className=" bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role={ "alert" }>
                  { actionSelected.alertMessage }
                </p>
              ) }
            </>
          ) }

          { loader === true ? (
            <button
              type="button"
              className="btn bg-leafy-800 hover:bg-leafy-900 text-white mt-3"
              disabled
            >
              <svg
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                fill="none"
                className="animate-spin mr-2"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  opacity="0.2"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  fill="white"
                />
                <path
                  d="M2 12C2 6.47715 6.47715 2 12 2V5C8.13401 5 5 8.13401 5 12H2Z"
                  fill="#00A35C"
                />
              </svg>
              Processing...
            </button>
          ) : (
            <button
              onClick={ (e) => {
                e.preventDefault()
                onAction()
              } }
              className="p-2 btn bg-leafy-800 hover:bg-leafy-900 text-white mt-3"
            >
              Submit
            </button>
          ) }


        </div>
      </div>
      <div className="flex-auto flex absolute space-x-4 bottom-4 right-2  ">
        <button id="toggle-dark-mode" className=" px-2 mr-2 btn bg-leafy-800 hover:bg-leafy-900 text-white mt-3 text-xs" onClick={ (e) => {
          e.preventDefault()
          toggleDarkMode()
        } }>Toggle Dark Mode</button>
        <button id="reset-to-system" className=" px-2 ml-2 btn bg-leafy-800 hover:bg-leafy-900 text-white mt-3 text-xs" onClick={ (e) => {
          e.preventDefault()
          resetThemeToSystem()
        } }>Reset to System Theme</button>
      </div>
    </div>
  )
}

export default IndexBanner
