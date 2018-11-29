"use strict";
const sqlite3 = require('sqlite3').verbose();

class Db {
    constructor(file) {
        this.db = new sqlite3.Database(file);
        this.createTable()
    }

    createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS user (
                id integer PRIMARY KEY, 
                name text, 
                email text UNIQUE, 
                user_pass text,
                is_host integer);
            CREATE TABLE IF NOT EXISTS competition (
                id integer PRIMARY KEY,
                name text UNIQUE,
                question text,
                start text, 
                end text);`
        return this.db.run(sql);
    }

    selectByEmail(email, callback) {
        return this.db.get(
            `SELECT * FROM user WHERE email = ?`,
            [email],
            function (err, row) {
                callback(err, row)
            })
    }

    insertAdmin(user, callback) {
        return this.db.run(
            'INSERT INTO user (name,email,user_pass,is_host) VALUES (?,?,?,?)',
            user, (err) => {
                callback(err)
            })
    }

    selectAllUsers(callback) {
        return this.db.all(`SELECT * FROM user`, function (err, rows) {
            callback(err, rows)
        })
    }

    insert(user, callback) {
        return this.db.run(
            'INSERT INTO user (name,email,user_pass) VALUES (?,?,?)',
            user, (err) => {
                callback(err)
            })
    }

    createCompetition(comp, callback) {
        return this.db.run(
            'INSERT INTO competitions (name,question,start,end) VALUES (?,?,?,?)',
            comp, (err) => {
                callback(err)
            })
    }

    selectByName(name, callback) {
        return this.db.get(
            'SELECT * FROM competitions WHERE name = ?',
            [name],
            function (err, row) {
                callback(err, row)
            })
    }

    selectAllComps(callback) {
        return this.db.all('SELECT * FROM competitions', (err, rows) => {
            callback(err, rows)
        })
    }
}

module.exports = Db