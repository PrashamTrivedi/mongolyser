import React from "react";
import StatSummary from "../dashboard/StatSummary";
import CONSTANTS from "../../misc/Constants";
import BackBanner from "./BackBanner";
import ScrollToTop from "react-scroll-to-top";
import QueryAnalyserDashboard from "../dashboard/QueryAnalyserDashboard";
import IndexStatsDashboard from "../dashboard/IndexStatsDashboard";
import WorkLoadDashboard from "../dashboard/WorkLoadDashboard";
import ClusterEventDashboard from "../dashboard/ClusterEventDashboard";
import ConnectionDashboard from "../dashboard/ConnectionDashboard";

export default function ResultLayout(props) {
  const { data, backAction, displayComponent, onAction } = props;
  const { INDEX, QUERY_ANALYSIS, CONNECTION_ANALYSIS, WORK_LOAD_ANALYSIS, CLUSTER_EVENT_ANALYSIS } = CONSTANTS;
  return (
    <div className="w-screen mb-10 dark:bg-black">
      <BackBanner backAction={backAction} />
      {
          displayComponent === INDEX && (
            <>
              <StatSummary dataList = {data.idx_summary} name={"Index Stats Summary"} />
              <IndexStatsDashboard data={data} />
            </>
          )
      }
      {
          displayComponent === QUERY_ANALYSIS && (
            <>
              <StatSummary dataList = {data.data.summary} name={"Query Analysis Summary"} />
              <QueryAnalyserDashboard data={data} onAction={onAction} backAction={backAction} />
            </>
          )
      }
      {
        displayComponent === CONNECTION_ANALYSIS && (
          <>
            <StatSummary dataList={data} name={"Connection Analysis Summary"} />
            <ConnectionDashboard data={data} />
          </>
        )
      }
      {
        displayComponent === WORK_LOAD_ANALYSIS && (
          <>
            <StatSummary dataList={data.oplogInformation} name={"Replication Summary"} noOfBoxes={2} />
            <WorkLoadDashboard data={data} />
          </>
        )
      }
      {
        displayComponent === CLUSTER_EVENT_ANALYSIS && (
          <>
            <ClusterEventDashboard data={data} />
          </>
        )
      }
      <ScrollToTop smooth className="scroll-mongo-to-top" />
    </div>
  );
}
