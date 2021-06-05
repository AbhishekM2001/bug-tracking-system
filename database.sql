CREATE DATABASE bug_tracking;

CREATE TABLE projects(
    id SERIAL PRIMARY KEY,
    pname TEXT UNIQUE,
    startdate TEXT,
    description TEXT
);


CREATE TABLE versions(
    id SERIAL PRIMARY KEY,
    vname TEXT UNIQUE,
    pname TEXT REFERENCES projects(pname),
    vno TEXT,
    releasedate TEXT,
    filername TEXT,
    comment TEXT,
    activebugs INTEGER
);

CREATE TABLE bugs(
    id SERIAL PRIMARY KEY,
    bname TEXT,
    vid INTEGER REFERENCES versions(id),
    bugdate TEXT,
    filername TEXT,
    bugpriority TEXT,
    comment TEXT,
    bugtype TEXT,
    bugstatus TEXT
);




-- CREATE TABLE versions(
--     id SERIAL PRIMARY KEY,
--     vname TEXT,
--     vno TEXT UNIQUE,
--     releasedate TEXT,
--     filername TEXT,
--     comment TEXT,
--     activebugs INTEGER
-- );

-- CREATE TABLE bugs(
--     id SERIAL PRIMARY KEY,
--     vid INTEGER REFERENCES versions(id),
--     bugdate TEXT,
--     filername TEXT,
--     bugpriority TEXT,
--     comment TEXT,
--     bugtype TEXT,
--     bugstatus TEXT
-- );