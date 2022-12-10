import React, { useState } from "react"
import IndexBanner from "../partials/dashboard/IndexBanner"
import ResultLayout from "../partials/Layout/ResultLayout"
import CONSTANTS from "../misc/Constants"


export default (props) => {
  const { DEFAULT, INDEX, QUERY_ANALYSIS, CONNECTION_ANALYSIS, WORK_LOAD_ANALYSIS, CLUSTER_EVENT_ANALYSIS } = CONSTANTS
  const [ visibleUI, setVisibleUI ] = useState(DEFAULT)
  const [ data, setData ] = useState({})

  // Cluster Call
  async function onIndexStats(path) {
    // Validation for path
    if (!path) {
      alert("Please enter the MongoDB URL to scan")
      return
    }

    try {
      const isDarkMode = await window.darkMode.isDarkMode()
      const data = await window.engineAPI.indexStats(path)
      if (!data) {
        return false
      }
      if (isDarkMode) {
        data.isDarkMode = isDarkMode
      }
      setData(data)
      setVisibleUI(INDEX)
    } catch (error) {
      console.error(error)
    }
  }

  async function onConnectionAnalysis(path) {
    // Validation for path
    if (!path) {
      alert("Please enter the MongoDB URL to scan")
      return
    }

    try {
      const isDarkMode = await window.darkMode.isDarkMode()
      const data = await window.engineAPI.connectionAnalysis(path)
      if (!data) {
        return false
      }
      if (isDarkMode) {
        data.isDarkMode = isDarkMode
      }
      setData(data)
      console.log(data)
      setVisibleUI(CONNECTION_ANALYSIS)
    } catch (error) {
      console.error(error)
    }
  }

  async function onWriteLoadAnalysis(path) {
    // Validation for path
    if (!path) {
      alert("Please enter the MongoDB URL to scan")
      return
    }

    try {
      const isDarkMode = await window.darkMode.isDarkMode()
      const data = await window.engineAPI.writeLoadAnalysis(path)
      if (!data) {
        return false
      }
      if (isDarkMode) {
        data.isDarkMode = isDarkMode
      }
      console.log(data)
      let display_oplog_count_by_optype = []
      let nameSpaces = data.oplog_count_by_optype.map((element) => {
        element.operations.forEach(ele => {
          element[ ele.op ] = ele.opCount
        })
        display_oplog_count_by_optype.push(element)
        return element._id || "No Op"
      })

      data.display_oplog_count_by_optype = display_oplog_count_by_optype
      data.nameSpaces = nameSpaces
      setData(data)

      setVisibleUI(WORK_LOAD_ANALYSIS)
    } catch (error) {
      console.error(error)
    }

  }

  // LogFile Analysis
  async function onFilePicker(event) {
    const file = event?.target?.files[ 0 ]
    const path = file?.path
    try {
      if (!file) {
        alert("Please select a log file to get started")
        setData({})
        return
      }
      setVisibleUI(DEFAULT)
      setData({ filePath: path })
    } catch (error) {
      alert("Error: Interal Engine Error")
      console.error(error)
    }
  }

  async function onQueryAnalysis(path) {
    if (!path) {
      alert("Please select a log file to get started")
      return
    }
    try {
      const isDarkMode = await window.darkMode.isDarkMode()
      const data = await window.engineAPI.queryAnalysis(path)
      if (isDarkMode) {
        data.isDarkMode = isDarkMode
      }
      setData(data)
      setVisibleUI(QUERY_ANALYSIS)
    } catch (error) {
      console.error(error)
    }
  }

  async function onClusterEventAnalysis(path) {
    if (!path) {
      alert("Please select a log file to get started")
      return
    }
    try {
      const isDarkMode = await window.darkMode.isDarkMode()
      const data = await window.engineAPI.clusterEventAnalysis(path)
      if (isDarkMode) {
        data.isDarkMode = isDarkMode
      }
      const clusterEvents = []
      console.log(data)
      setData(data)
      console.log(data)
      setVisibleUI(CLUSTER_EVENT_ANALYSIS)
    } catch (error) {
      console.error(error)
    }
  }

  function onActionTrigger({ value, payload, path, type }) {

    console.log("onActionTrigger:path", path)
    switch (value) {
      case "Index Analysis":
        return onIndexStats(path)
      case "File Picker":
        onFilePicker(payload)
        break
      case "Query Analysis":
        return onQueryAnalysis(path)
      case "Query Analysis Filter":
        onQueryAnalysis(path)
        break
      case "Connection Analysis":
        return onConnectionAnalysis(path)
      case "Write Load Analysis":
        return onWriteLoadAnalysis(path)
      case "Cluster Event Analysis":
        return onClusterEventAnalysis(path)
      default:
        break
    }
  }

  function onBackAction() {
    setVisibleUI(DEFAULT)
  }

  return (
    <>
      { visibleUI === DEFAULT ? (
        <div className="flex bg-leafy-200 dark:bg-black w-screen min-h-screen">
          <IndexBanner
            data={ data }
            onAction={ onActionTrigger }
            backAction={ onBackAction }
          />
        </div>
      ) : (
        <ResultLayout data={ data } backAction={ onBackAction } onAction={ onActionTrigger } displayComponent={ visibleUI } />
      ) }
    </>
  )
}
