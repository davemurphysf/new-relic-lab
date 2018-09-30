local method = { "GET", "POST", "DELETE" }
local store = { "redis", "storage", "db" }

-- Initialize the pseudo random number generator
-- Resource: http://lua-users.org/wiki/MathLibraryTutorial
math.randomseed(os.time())
math.random(); math.random(); math.random()

function getMethod()
    local selection = math.random(1,3)
    return method[selection]
end

function getStore()
    local selection = math.random(1,3)
    return store[selection]
end

function getAlphaChar()
    selection = math.random(1, 3)
    if selection == 1 then return string.char(math.random(65, 90)) end
    if selection == 2 then return string.char(math.random(97, 122)) end
    return string.char(math.random(48, 57))
end

function getRandomString(length)
    length = length or 1
    if length < 1 then return nil end
    local array = {}
    for i = 1, length do
        array[i] = getAlphaChar()
    end
    return table.concat(array)
end

function removeTrailingSlash(s)
    return (s:gsub("(.-)/*$", "%1"))
end

request = function()
    wrk.headers["Connection"] = "Keep-Alive"
    wrk.headers["Content-Type"] = "application/json; charset=utf-8"
    local method = getMethod()
    -- local method = "POST"
    local store = getStore()
    local key = getRandomString(4)
    local body = wrk.body

    local newPath = wrk.path .. "/" .. store .. "/" .. key

    if method == "POST" then 
        newPath = wrk.path .. "/" .. store .. "/" .. key .. "?value=" .. getRandomString(64)
        body = "{}"
    end

    return wrk.format(method, newPath, wrk.headers, body)
end