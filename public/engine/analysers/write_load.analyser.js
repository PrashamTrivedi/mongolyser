const MongoDBAdapter = require("../adapters/mongodb.adapter").MongoDBAdapter;
const { dialog } = require('electron');

exports.get_write_load_analysis = async (channel, connString) => {
  try {
    // Connect to MongoDB
    let mongoDBAdapter = new MongoDBAdapter();
    await mongoDBAdapter.connect(connString, "local");

    // Get Group By OpType
    let oplog_count_by_optype_promise = mongoDBAdapter.runAggregation(
      "oplog.rs",
      [
        {
          $group: {
            _id: {
              op: "$op",
              ns: "$ns",
            },
            opCount: {
              $sum: 1,
            },
          },
        },
        {
          $group: {
            _id: "$_id.ns",
            operations: { $push: { op: "$_id.op", opCount: "$opCount" } },
          },
        },
      ],
      true
    );

    // Get Largest Document in Oplog
    let largest_oplog_promise = mongoDBAdapter.runAggregation(
      "oplog.rs",
      [
        {
          $addFields: {
            object_size: {
              $bsonSize: "$$ROOT",
            },
          },
        },
        {
          $sort: {
            object_size: -1,
          },
        },
        {
          $group: {
            _id: "$op",
            maxSize: {
              $max: "$object_size",
            },
            originalDoc: {
              $first: "$$ROOT",
            },
          },
        },
      ],
      true
    );

    async function oplogInfo() {
      var result = {};
      var oplog = "oplog.rs";
      mongoDBAdapter.switchDatabase("local");
      var localCollections = await mongoDBAdapter.listCollections("local");
      if (localCollections.find((db) => db.name === "oplog.rs")) {
        oplog = "oplog.rs";
      } else {
        result.errmsg = "replication not detected";
        return result;
      }

      var ol_stats = await mongoDBAdapter.getCollectionStats(oplog);
      // console.log(ol_stats);

      result.usedMB = ol_stats.size / (1024 * 1024);
      result.usedMB = Math.ceil(result.usedMB * 100) / 100;
      result.configuredSize = ol_stats.maxSize / (1024 * 1024);

      var firstc = await mongoDBAdapter.findDocFieldsByFilter(oplog, {}, {}, 1, {
        $natural: 1,
      });
      var lastc = await mongoDBAdapter.findDocFieldsByFilter(oplog, {}, {}, 1, {
        $natural: -1,
      });

      var tfirst = firstc?.[0]?.ts;
      var tlast = lastc?.[0]?.ts;

      if (tfirst && tlast) {
        tfirst = tsToSeconds(tfirst);
        tlast = tsToSeconds(tlast);
        result.timeDiff = tlast - tfirst;
        result.timeDiffHours = Math.round(result.timeDiff / 36) / 100;
        result.tFirst = new Date(tfirst * 1000).toString();
        result.tLast = new Date(tlast * 1000).toString();
        result.oplogGbPerHour = Math.ceil(
          result.configuredSize / result.timeDiffHours
        );
        result.recomendedAtlas = Math.ceil(result.oplogGbPerHour * 24);
        result.now = Date();
      } else {
        result.errmsg = "ts element not found in oplog objects";
      }

      return result;
    }

    const tsToSeconds = (x) => {
      if (x.t && x.i) return x.t;
      return x / 4294967296;
    };

    const [oplog_count_by_optype, largest_oplog, oplogInformation] =
      await Promise.all([
        oplog_count_by_optype_promise,
        largest_oplog_promise,
        oplogInfo(),
      ]);

    return {
      oplog_count_by_optype: oplog_count_by_optype,
      largest_oplog: largest_oplog,
      oplogInformation: oplogInformation,
    };
  } catch (ex) {
    console.error(ex);
    dialog.showMessageBoxSync({
      message: err.message,
      title: "Something Went Wrong.",
      type: "info"
    })
  }
};
