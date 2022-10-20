const LocalDBAdapter = require("../adapters/nedb.adapter").LocalDBAdapter;
const fs = require("fs");
const es = require('event-stream');
const {
    process_aggregation,
    filter_commands,
    parse_optype,
    redact_v2,
    is_valid_json
} = require('../utils/common.utility');

const { isBefore, isAfter, isDate } = require("date-fns");

const DEFAULT_SLOW_MS = 100;


exports.analyse_queries = async (channel, log_file, slow_ms = DEFAULT_SLOW_MS) => {

    return new Promise((resolve, reject) => {
        let parsed_log_summary = {
            nCOLLSCAN: 0,
            nSlowOps: 0,
            nFind: 0,
            nGetMore: 0,
            nAggregate: 0,
            nInsert: 0,
            nUpdate: 0,
            slowestOp: 0,
            nCount: 0,
            slowestQuery: ""
        };

        const namespacesList = new Set();
        const timeRange = {
            start: new Date("2019-12-02"),
            end: new Date("2019-12-02")
        }

        // Create NeDB Instance
        let local_db_detail = new LocalDBAdapter("query_analysis_detail");
        let local_db_grouped = new LocalDBAdapter("query_analysis_grouped");
        let local_db_summary = new LocalDBAdapter("query_analysis_summary");

        // Initiate Log Stream
        let stream = fs.createReadStream(log_file)
            .pipe(es.split())
            .pipe(es.mapSync(function (log_line) {
                // Pause the log stream to process the line
                stream.pause();

                // Ignore if log line is empty or null
                if (is_valid_json(log_line)) {

                    // Parse Log Line to JSON
                    let log = JSON.parse(log_line)

                    // Only parse commands for the scope
                    // Filter out the commands with undefined attr and ns
                    if (log.c === "COMMAND"
                        && typeof (log.attr) != 'undefined'
                        && typeof (log.attr.ns) != 'undefined') {

                        // Set default appName
                        if (!log.attr.appName) log.attr.appName = "";

                        // Filter Out System Commands
                        if (filter_commands(log.attr)) {

                            /*  
                                Detect OpType
                                Current list of supported opTypes include Insert, Find, Update,
                                getMore, Aggregate & Count 
                            */
                            let opType = parse_optype(log.attr.command);

                            // Check for acceptable OpType
                            if (opType) {
                                // Filter Query Details
                                let parsed_log = {
                                    "Op Type": opType,
                                    "timestamp": log.t.$date,
                                    "Duration": Number(log.attr.durationMillis),
                                    "QTR": "-",
                                    "Namespace": log.attr.ns,
                                    "Filter": {},
                                    "Sort": "No Sort",
                                    "Lookup": "N.A.",
                                    "Blocking": "N.A.",
                                    "Plan Summary": "N.A.",
                                    "App Name": log.attr.appName,
                                    "QueryHash": log.attr.queryHash,
                                    "Log": String(log_line)
                                }

                                // Only store unique collections list upto 300 collections;
                                if (namespacesList.size < 300) {
                                    // Add namespace to the group
                                    namespacesList.add(parsed_log.Namespace);
                                }

                                // Calculate SlowOp Count
                                if (parsed_log.Duration >= slow_ms) {
                                    parsed_log_summary.nSlowOps++;

                                    if (opType === "Find") {
                                        parsed_log.Filter = JSON.stringify(log.attr.command.filter);
                                        parsed_log.Sort = (log.attr.command.sort) ? JSON.stringify(log.attr.command.sort) : "No Sort";
                                        parsed_log["Plan Summary"] = log.attr.planSummary;
                                        if (parsed_log["Plan Summary"] === "COLLSCAN") parsed_log_summary.nCOLLSCAN++;
                                        parsed_log_summary.nFind++;

                                        // Calculate QTR
                                        if (log.attr.nreturned == 0) {
                                            parsed_log.QTR = "No Document Returned";
                                        }
                                        else {
                                            parsed_log.QTR = log.attr.docsExamined / log.attr.nreturned;
                                            parsed_log.QTR = Math.round(parsed_log.QTR)
                                        }
                                    }
                                    if (opType === "Count") {
                                        parsed_log.Filter = JSON.stringify(log.attr.command.query);
                                        parsed_log["Plan Summary"] = log.attr.planSummary;
                                        if (parsed_log["Plan Summary"] === "COLLSCAN") parsed_log_summary.nCOLLSCAN++;
                                        parsed_log_summary.nCount++;

                                        // In case of Count - QTR will always be equal to docs examined
                                        parsed_log.QTR = log.attr.docsExamined;
                                    }
                                    if (opType === "Aggregate") {
                                        let aggregation = process_aggregation(log.attr.command.pipeline);
                                        parsed_log.Filter = JSON.stringify(aggregation.filter);
                                        parsed_log.Sort = JSON.stringify(aggregation.sort);
                                        parsed_log.Blocking = aggregation.blocking;
                                        parsed_log.Lookup = aggregation.lookup;
                                        parsed_log["Plan Summary"] = log.attr.planSummary;
                                        if (parsed_log["Plan Summary"] === "COLLSCAN") parsed_log_summary.nCOLLSCAN++;
                                        parsed_log_summary.nAggregate++;

                                        // Calculate QTR
                                        if (log.attr.nreturned == 0) {
                                            parsed_log.QTR = "No Document Returned";
                                        }
                                        else {
                                            parsed_log.QTR = log.attr.docsExamined / log.attr.nreturned;
                                            parsed_log.QTR = Math.round(parsed_log.QTR)
                                        }
                                    }
                                    if (opType === "getMore") {
                                        if (typeof (log.attr.originatingCommand.pipeline) != "undefined") {
                                            let aggregation = process_aggregation(log.attr.originatingCommand.pipeline);
                                            parsed_log.Filter = JSON.stringify(aggregation.filter);
                                            parsed_log.Sort = JSON.stringify(aggregation.sort);
                                            parsed_log.Blocking = aggregation.blocking;
                                            parsed_log.Lookup = aggregation.lookup;
                                        } else {
                                            parsed_log.Filter = JSON.stringify(log.attr.originatingCommand.filter);
                                            parsed_log.Sort = (log.attr.originatingCommand.sort) ? JSON.stringify(log.attr.originatingCommand.sort) : "No Sort";
                                        }
                                        parsed_log["Plan Summary"] = log.attr.planSummary;
                                        if (parsed_log["Plan Summary"] === "COLLSCAN") parsed_log_summary.nCOLLSCAN++;
                                        parsed_log_summary.nGetMore++;
                                    }
                                    if (opType === "Update") {
                                        // Bypass UpdateMany Logs As they do not contain much information
                                        if (typeof (log?.attr?.command?.updates?.[0]) != 'undefined')
                                            parsed_log.Filter = JSON.stringify(log.attr.command.updates[0].q);
                                        else
                                            parsed_log.Filter = JSON.stringify({});

                                        if (parsed_log["Plan Summary"] === "COLLSCAN") parsed_log_summary.nCOLLSCAN++;
                                        parsed_log_summary.nUpdate++;
                                    }
                                    if (opType === "Insert") {
                                        parsed_log_summary.nInsert++;
                                        parsed_log.Filter = JSON.stringify({})
                                    }

                                    if (parsed_log.Duration > parsed_log_summary.slowestOp) {
                                        parsed_log_summary.slowestOp = parsed_log.Duration;
                                        parsed_log_summary.slowestQuery = JSON.stringify(parsed_log.Filter);
                                    }

                                    // compare the timestamps
                                    // and store the filter range
                                    if (isDate(new Date(parsed_log.timestamp))) {
                                        if (isBefore(timeRange.start, new Date(parsed_log.timestamp))) {
                                            timeRange.start = new Date(parsed_log.timestamp)
                                        }

                                        if (isAfter(new Date(parsed_log.timestamp), timeRange.end)) {
                                            timeRange.end = new Date(parsed_log.timestamp)
                                        }
                                    }


                                    // Insert to local data store in temp directory
                                    local_db_detail.insert({ ...parsed_log }).catch(e => {
                                        console.error(e)
                                    });

                                    // Set the Grouped Update
                                    local_db_grouped.update({ "QueryHash": (parsed_log.QueryHash ? parsed_log.QueryHash : "No Hash") }, {
                                        $set: {
                                            ...parsed_log,
                                            QueryHash: (parsed_log.QueryHash ? parsed_log.QueryHash : "No Hash")
                                        },
                                        $inc: {
                                            count: 1
                                        }
                                    }, { upsert: true }).catch(e => console.error(e));
                                }
                            }
                        }
                    }
                }

                // resume the read stream, possibly from a callback
                stream.resume();
            }))
            .on('error', function (err) {
                console.log(err);
                dialog.showMessageBoxSync({
                    message: err.message,
                    title: "Something Went Wrong.",
                    type: "info"
                });
            })
            .on('end', async function () {
                console.log("Sending Results to client");
                local_db_summary.insert(parsed_log_summary).catch(console.error);

                const dataGrouped = await local_db_grouped.fetch({}, 20, 0, { "count": -1 }).catch(e => console.log(e))
                const totalGrouped = await local_db_grouped.count({}).catch(console.error);
                resolve({
                    status: 200,
                    data: {
                        summary: parsed_log_summary,
                        initialData: [],
                        initialDataGrouped: dataGrouped,
                        filters: {
                            namespaces: Array.from(namespacesList),
                            timeRange: timeRange
                        },
                        pagination: {
                            currentPage: 1,
                            count: totalGrouped,
                        },
                        sortOrder: { "count": -1 }
                    },
                    success: true,
                    message: "Analysis Saved in Local Data Store"
                })
            });
    })
}

const defaultFilters = {
    optype: [],
    namespaces: [],
    slowms: DEFAULT_SLOW_MS
}

const defaultSort = {
    grouped: {
        "count": -1
    },
    detailed: {
        "Duration": -1
    }
}

const defaultOptions = {
    grouped: true
}

exports.analyse_queries_filter = async (channel, filters = defaultFilters, page = 1, sort, options = defaultOptions) => {
    // Create NeDB Instance
    let local_db_detail = new LocalDBAdapter("query_analysis_detail", { noClear: true });
    let local_db_grouped = new LocalDBAdapter("query_analysis_grouped", { noClear: true });

    const query = {}

    // Operation type
    if (filters.optype.length > 0) {
        query["Op Type"] = { "$in": filters.optype }
    }

    // namespaces
    if (filters.namespaces.length > 0) {
        query["Namespace"] = { "$in": filters.namespaces }
    }

    // Slow Ms
    // 100 - Default Slow MS
    if (filters.slowms > DEFAULT_SLOW_MS) {
        query["Duration"] = { "$gte": Number(filters.slowms) }
    }

    let total = null;
    let data = null;
    let sortBy = null;

    if (options.grouped) {
        sortBy = sort ? sort : defaultSort.grouped
        data = await local_db_grouped.fetch(query, 20, page - 1, sortBy);
        total = await local_db_grouped.count(query);
    } else {
        sortBy = sort ? sort : defaultSort.detailed;
        data = await local_db_detail.fetch(query, 20, page - 1, sortBy);
        total = await local_db_detail.count(query);
    }
    return {
        status: 200,
        data: data,
        pagination: {
            currentPage: page,
            count: total
        },
        sortOrder: sortBy
    }
}