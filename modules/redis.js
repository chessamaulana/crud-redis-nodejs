const redis = require("redis")

const client = redis.createClient();

async function set(key, value) {
    
    client.on("error", (err) => console.log("Redis Client Error", err));

    await client.connect();

    await client.set(key, value);
    await client.disconnect();
    return "Write to cache";

}

async function get(key) {

    client.on("error", (err) => console.log("Redis Client Error", err));

    await client.connect();

    const value = await client.get(key);
    await client.disconnect();
    return value;
}

module.exports = {
    set: set,
    get: get
}