const MongoDBAdapter = require("../adapters/mongodb.adapter").MongoDBAdapter;


exports.get_current_conn_analysis = async (channel, connectionString) => {
    console.log(connectionString);
    // Connect to MongoDB 
    let mongoDBAdapter = new MongoDBAdapter();
    await mongoDBAdapter.connect(connectionString);

    let serverStatus = await mongoDBAdapter.runCommand({ serverStatus: 1 })
    let connections = (await mongoDBAdapter.runCommand({ currentOp: 1 })).inprog.reduce(
        (accumulator, connection) => {
            ipaddress = connection.client ? connection.client.split(":")[0] : "Internal";
            accumulator[ipaddress] = (accumulator[ipaddress] || 0) + 1;
            return accumulator;
        },
        {}
    );
    const connectionList = []
    for (const key in connections) {
        if (Object.hasOwnProperty.call(connections, key)) {
            connectionList.push({ip: key, count: connections[key]})
        }
    }
    return {
        current_connections: serverStatus.connections.current,
        available_connections: serverStatus.connections.available,
        total_created_connections: serverStatus.connections.totalCreated,
        active_connections: serverStatus.connections.active,
        connectionList: connectionList
    }
};