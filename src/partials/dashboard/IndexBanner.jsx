import React, { useEffect, useState } from "react";
import Select from "react-select";
import heroImage from "../../images/hero.png";

// TODO: Discuss should we have a central place to list all analysis
function IndexBanner(props) {
  const [actions, setActions] = useState([
    { value: "Index Analysis", label: "Index Analysis", type: "cluster" },
    // { value: "Oplog Analysis", label: "Oplog Analysis", type: "cluster" },
    {
      value: "Query Analysis",
      label: "Query Analysis (Log Analysis)",
      type: "log",
    },
  ]);
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

  const [actionSelected, setActionSelected] = useState({});
  const [connectionUrl, setConnectionUrl] = useState("");
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (props?.data?.filePath) {
      setConnectionUrl(props.data.filePath);
    }
    return () => {
      setLoader(false);
    };
  }, [props?.data?.filePath]);

  function toggleLoader() {
    setLoader(!loader);
  }

  return (
    <div className="w-full flex items-center bg-white">
      <div className="w-1/2 bg-leafy-900 h-full flex items-center">
        <img src={heroImage} />
      </div>
      <div className="relative pl-6 md:pl-28 rounded-sm w-1/2">
        <div className="max-w-sm w-5/6">
          {/* Background illustration */}
          <div
            className="absolute right-0 top-0 -mt-4 mr-16 pointer-events-none hidden xl:block"
            aria-hidden="true"
          ></div>

          {/* Content */}
          <div className="relative">
            <h1 className="text-2xl md:text-3xl text-slate-800 font-bold mb-1">
              Hello 👋!
            </h1>
            <p>Please select the analysis you want to do:</p>
          </div>

          <Select
            placeholder="Select Analysis Type"
            value={actionSelected}
            options={actions}
            onChange={(value) => setActionSelected(value)}
          />

          {actionSelected.type === "cluster" && (
            <div className="mt-5">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label inline-block mb-2 text-gray-700"
              >
                Enter Cluster Link
              </label>
              <input
                id="exampleFormControlInput1"
                value={connectionUrl}
                onChange={(e) => setConnectionUrl(e.target.value)}
                placeholder="mongodb+srv://your-cluster-link/?rsname"
                className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-leafy-600 rounded transition ease-in-out m-0 focus:border-leafy-600 focus:bg-white focus:border-leafy-600 focus:outline-none"
              />
            </div>
          )}

          {actionSelected.type === "log" && (
            <>
              <label class="mt-4 block text-sm font-medium text-slate-600" for="file_input">Upload file</label>
              <input
                className="block p-2 w-full text-sm text-grey bg-white rounded-lg border border-leafy-300 cursor-pointer focus:outline-none"
                id="file_input"
                type="file"
                onChange={(e) => {
                  props.onAction({ value: "File Picker", payload: e });
                }}
                accept=".log"
              />
              <p class=" text-sm text-slate-700" id="file_input_help">.log (max size - 1GB)</p>
            </>
          )}

          {loader === true ? (
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
              onClick={(e) => {
                e.preventDefault();
                props.onAction({
                  value: actionSelected.value,
                  type: actionSelected.type,
                  path: connectionUrl,
                });
                toggleLoader();
              }}
              className="p-2 btn bg-leafy-800 hover:bg-leafy-900 text-white mt-3"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default IndexBanner;
