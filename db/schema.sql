CREATE TABLE department (
  id SERIAL,
  department_name VARCHAR(30)
);

CREATE TABLE roles (
    id SERIAL,
    role_title VARCHAR(30) NOT NULL,
    salary (10,2),
    department_id INTEGER NOT NULL
);

CREATE TABLE employee (
    id SERIAL,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER NOT NULL,
    manager_id INTEGER
);