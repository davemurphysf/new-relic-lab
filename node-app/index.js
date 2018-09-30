const newrelic = require('newrelic');
const express = require('express');
const app = express();

const { Storage } = require('@google-cloud/storage');
const bucketName = process.env.BUCKET_NAME;
const storage = new Storage();
const myBucket = storage.bucket(bucketName);

const redis = require("redis");
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    retry_strategy: function (options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with
            // a individual error
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands
            // with a individual error
            return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
            // End reconnecting with built in error
            return undefined;
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    }
});
redisClient.on("error", function (err) {
    console.log("Redis Error " + err);
});

const { Pool, Client } = require('pg');
const pool = new Pool();
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

let START_TIME;


// Middleware for adding custom attributes
// These map to environment variables exposed in the pod spec
const CUSTOM_PARAMETERS = {
    'K8S_NODE_NAME': process.env.K8S_NODE_NAME,
    'K8S_HOST_IP': process.env.K8S_HOST_IP,
    'K8S_POD_NAME': process.env.K8S_POD_NAME,
    'K8S_POD_NAMESPACE': process.env.K8S_POD_NAMESPACE,
    'K8S_POD_IP': process.env.K8S_POD_IP,
    'K8S_POD_SERVICE_ACCOUNT': process.env.K8S_POD_SERVICE_ACCOUNT,
    'K8S_POD_TIER': process.env.K8S_POD_TIER
};

app.use(function (req, res, next) {
    START_TIME = Date.now();
    newrelic.addCustomAttributes(CUSTOM_PARAMETERS);
    next();
});

app.get('/api/redis/:key', function (req, res) {
    if (!req.params.key) {
        return res.sendStatus(400);
    }

    redisClient.get(req.params.key, function (err, redisResponse) {
        if (err) {
            return res.send({
                success: false,
                duration: Date.now() - START_TIME,
                value: err
            });
        }

        if (!redisResponse) {
            return res.send({
                success: false,
                duration: Date.now() - START_TIME,
                value: null
            });
        } else {
            return res.send({
                success: true,
                duration: Date.now() - START_TIME,
                value: redisResponse
            })
        }
    });
});

app.put('/api/redis/:key', function (req, res) {
    if (!req.params.key || !req.query.value) {
        return res.sendStatus(400);
    }

    redisClient.set(req.params.key, req.query.value, function (err, redisResponse) {
        if (err) {
            return res.send({
                success: false,
                duration: Date.now() - START_TIME,
                value: err
            });
        }

        if (!redisResponse) {
            return res.send({
                success: false,
                duration: Date.now() - START_TIME,
                value: null
            });
        } else {
            return res.send({
                success: true,
                duration: Date.now() - START_TIME,
                value: redisResponse
            })
        }
    });
});

app.post('/api/redis/:key', function (req, res) {
    if (!req.params.key || !req.query.value) {
        return res.sendStatus(400);
    }

    redisClient.set(req.params.key, req.query.value, function (err, redisResponse) {
        if (err) {
            return res.send({
                success: false,
                duration: Date.now() - START_TIME,
                value: err
            });
        }

        if (!redisResponse) {
            return res.send({
                success: false,
                duration: Date.now() - START_TIME,
                value: null
            });
        } else {
            return res.send({
                success: true,
                duration: Date.now() - START_TIME,
                value: redisResponse
            })
        }
    });
});

app.delete('/api/redis/:key', function (req, res) {
    if (!req.params.key) {
        return res.sendStatus(400);
    }

    redisClient.del(req.params.key, function (err, redisResponse) {
        if (err) {
            return res.send({
                success: false,
                duration: Date.now() - START_TIME,
                value: err
            });
        }

        if (!redisResponse) {
            return res.send({
                success: false,
                duration: Date.now() - START_TIME,
                value: null
            });
        } else {
            return res.send({
                success: true,
                duration: Date.now() - START_TIME,
                value: redisResponse
            })
        }
    });
});

app.get('/api/storage/:key', function (req, res) {
    if (!req.params.key) {
        return res.sendStatus(400);
    }

    const file = myBucket.file(req.params.key);

    file.exists().then(data => {
        const exists = data[0];

        if (exists) {
            file.download().then(function (data) {
                return res.send({
                    success: true,
                    duration: Date.now() - START_TIME,
                    value: data[0].toString('utf8')
                });
            }).catch(err => {
                return res.send({
                    success: false,
                    duration: Date.now() - START_TIME,
                    value: err.message
                });
            });
        } else {
            return res.send({
                success: false,
                duration: Date.now() - START_TIME,
                value: "No such object"
            });
        }
    }).catch(err => {
        return res.send({
            success: false,
            duration: Date.now() - START_TIME,
            value: err.message
        });
    });
});

app.post('/api/storage/:key', function (req, res) {
    if (!req.params.key || !req.query.value) {
        return res.sendStatus(400);
    }

    const file = myBucket.file(req.params.key);

    const stream = file.createWriteStream({
        metadata: {
            contentType: "text/plain"
        },
        resumable: false
    });

    stream.on('error', (err) => {
        return res.send({
            success: false,
            duration: Date.now() - START_TIME,
            value: err.message || 'false'
        });
    });

    stream.on('finish', () => {
        return res.send({
            success: true,
            duration: Date.now() - START_TIME,
            value: req.query.value
        });
    });

    stream.end(req.query.value);
});

app.put('/api/storage/:key', function (req, res) {
    if (!req.params.key || !req.query.value) {
        return res.sendStatus(400);
    }

    const file = myBucket.file(req.params.key);

    const stream = file.createWriteStream({
        metadata: {
            contentType: "text/plain"
        },
        resumable: false
    });

    stream.on('error', (err) => {
        return res.send({
            success: false,
            duration: Date.now() - START_TIME,
            value: err.message || 'false'
        });
    });

    stream.on('finish', () => {
        return res.send({
            success: true,
            duration: Date.now() - START_TIME,
            value: req.query.value
        });
    });

    stream.end(req.query.value);
});

app.delete('/api/storage/:key', function (req, res) {
    if (!req.params.key) {
        return res.sendStatus(400);
    }

    const file = myBucket.file(req.params.key);

    file.delete().then(data => {
        return res.send({
            success: true,
            duration: Date.now() - START_TIME,
            value: true
        });
    }).catch(err => {
        return res.send({
            success: false,
            duration: Date.now() - START_TIME,
            value: err.message
        });
    });
});

app.get('/api/db/:key', function (req, res) {
    if (!req.params.key) {
        return res.sendStatus(400);
    }

    pool.query('SELECT value FROM data WHERE key = $1', [req.params.key], (err, resp) => {
        if (err) {
            return res.send({
                success: false,
                duration: Date.now() - START_TIME,
                value: err.message || false
            });
        }

        if (!resp.rows[0] || !resp.rows[0].value) {
            return res.send({
                success: false,
                duration: Date.now() - START_TIME,
                value: false
            });
        }

        console.log('value:', resp.rows[0].value);

        return res.send({
            success: true,
            duration: Date.now() - START_TIME,
            value: resp.rows[0].value
        });
    });
});

app.post('/api/db/:key', function (req, res) {
    if (!req.params.key || !req.query.value) {
        return res.sendStatus(400);
    }

    pool.query('SELECT value FROM data WHERE key = $1', [req.params.key], (err, resp) => {
        if (err) {
            return res.send({
                success: false,
                duration: Date.now() - START_TIME,
                value: err.message || false
            });
        }

        if (!resp.rows[0] || !resp.rows[0].value) {
            pool.query('INSERT INTO data(key,value) VALUES ($1,$2)', [req.params.key, req.query.value], (err, resp) => {
                if (err) {
                    return res.send({
                        success: false,
                        duration: Date.now() - START_TIME,
                        value: err.message || false
                    });
                }

                return res.send({
                    success: true,
                    duration: Date.now() - START_TIME,
                    value: req.query.value
                });
            });
        } else {
            pool.query('UPDATE data SET value = ($2) WHERE key = ($1)', [req.params.key, req.query.value], (err, resp) => {
                if (err) {
                    return res.send({
                        success: false,
                        duration: Date.now() - START_TIME,
                        value: err.message || false
                    });
                }

                return res.send({
                    success: true,
                    duration: Date.now() - START_TIME,
                    value: req.query.value
                });
            });
        }
    });
});

app.put('/api/db/:key', function (req, res) {
    if (!req.params.key || !req.query.value) {
        return res.sendStatus(400);
    }

    pool.query('SELECT value FROM data WHERE key = $1', [req.params.key], (err, resp) => {
        if (err) {
            return res.send({
                success: false,
                duration: Date.now() - START_TIME,
                value: err.message || false
            });
        }

        if (!resp.rows[0] || !resp.rows[0].value) {
            pool.query('INSERT INTO data(key,value) VALUES ($1,$2)', [req.params.key, req.query.value], (err, resp) => {
                if (err) {
                    return res.send({
                        success: false,
                        duration: Date.now() - START_TIME,
                        value: err.message || false
                    });
                }

                return res.send({
                    success: true,
                    duration: Date.now() - START_TIME,
                    value: req.query.value
                });
            });
        } else {
            pool.query('UPDATE data SET value = ($2) WHERE key = ($1)', [req.params.key, req.query.value], (err, resp) => {
                if (err) {
                    return res.send({
                        success: false,
                        duration: Date.now() - START_TIME,
                        value: err.message || false
                    });
                }

                return res.send({
                    success: true,
                    duration: Date.now() - START_TIME,
                    value: req.query.value
                });
            });
        }
    });
});

app.delete('/api/db/:key', function (req, res) {
    if (!req.params.key) {
        return res.sendStatus(400);
    }

    pool.query('DELETE FROM data WHERE key = $1 RETURNING *', [req.params.key], (err, resp) => {
        if (err) {
            return res.send({
                success: false,
                duration: Date.now() - START_TIME,
                value: err.message || false
            });
        }

        if (!resp.rows[0] || !resp.rows[0].value) {
            return res.send({
                success: false,
                duration: Date.now() - START_TIME,
                value: false
            });
        }

        return res.send({
            success: true,
            duration: Date.now() - START_TIME,
            value: true
        });
    });
});

app.get('*', function (req, res) {
    res.send('Hello World');
});

app.listen(3000);

console.log('Listening on port 3000');
