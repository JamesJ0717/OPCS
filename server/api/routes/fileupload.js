const express = require('express')
const router = express.Router()
const fileUpload = require('express-fileupload')
const fs = require('fs')

const docker = require('../js/docker')
const DB = require('../../db')
const db = new DB('sqlite3')

const SIZELIMIT = 5240000

router.use(fileUpload())

function filesForCID(cid) {
    var gen = fs.readdirSync('uploads/competitions/' + cid + '/gen/')[0]
    var eval = fs.readdirSync('uploads/competitions/' + cid + '/eval/')[0]
    return [
        'uploads/competitions/' + cid + '/gen/' + gen,
        'uploads/competitions/' + cid + '/eval/' + eval
    ]
}

//console.log(filesForCID('y30Hk'));

router.post('/', (req, res, next) => {
    if (!req.files) {
        return res
            .json({
                message: 'No file was uploaded! ' + req.files,
                status: 400
            })
            .status(400)
    }

    let filetoupload = req.files.filetoupload
    let fileName = filetoupload.name
    let fileExt = fileName.split('.').pop()
    let filePath = 'uploads/competitions/'
    let fileSize = req.headers['content-length']

    let compName = req.body.compName
    let dockerResult = ''
    let isError = false
    let compFilePath = filePath + compName
    let compFileName = compFilePath + '/' + fileName

    // let teamName = document.cookie;

    if (fileExt === 'py' || fileExt === 'java') {
        if (fileSize > SIZELIMIT) {
            res.json({
                message: 'FILE TOO BIG! \nplease upload a file less than ' +
                    SIZELIMIT / 1000000 +
                    ' megabytes',
                status: 401
            }).status(401)
        } else if (fileSize < SIZELIMIT) {
            filetoupload.mv(compFileName, function (err) {
                if (err) {
                    console.log(err)
                    return res
                        .json({
                            message: err,
                            status: 500
                        })
                        .status(500)
                }
                let message = filetoupload.name + ' uploaded!'
                console.log(message)
            })

            try {
                var files = filesForCID(compName)
                console.log('docker')
                // console.log(files[0] + '\n')
                // console.log(files[1])
                docker.fullRun(files[0], compFileName, files[1], result => {
                    console.log(result)
                    dockerResult = result
                    if (dockerResult.includes('An error occurred while')) isError = true
                    else isError = false

                    if (isError) {
                        return res.json({
                            message: dockerResult,
                            status: 500
                        }).status(500)
                    } else {
                        db.addScore([req.body.userName, req.body.compId, dockerResult, req.body.compName], (err) => {
                            if (err) {
                                return res.json({
                                    message: err,
                                    status: 500
                                }).status(500)
                            } else {
                                console.log('Score added!')
                            }
                        })
                        return res.json({
                            message: filetoupload.name + ' uploaded!',
                            score: dockerResult,
                            status: 200
                        }).status(200)
                    }

                })
            } catch (err) {
                console.log('Error: invalid competition ID: ')
                console.log(err)
            }
        }
    } else {
        // alert('Not accepted')
        console.log('Not accepted')
        res.json({
            status: 404,
            message: 'File type not accepted'
        }).status(404)
    }
})

function randString(length) {
    var text = ''
    var possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length))

    return text
}

function makeCompId(N) {
    var name = randString(N)
    while (fs.existsSync('uploads/competitions/' + name)) {
        name = randString(N)
    }

    return name
}

function vettAndUpload(file, path, fileSize) {
    let fileName = file.name
    let fileExt = fileName.split('.').pop()
    let filePath = path + fileName

    if (fileExt != 'py' && fileExt != 'java') {
        return false
    }

    if (fileSize > SIZELIMIT) {
        return false
    } else if (fileSize < SIZELIMIT) {
        file.mv(filePath, function (err) {
            if (err) console.log(err)
        })
    }

    return true
}

router.post('/question', (req, res, next) => {
    if (!req.files) {
        return res
            .json({
                message: 'No files were uploaded',
                status: 500
            })
            .status(500)
    }

    // var cid = makeCompId(5)
    let cid = req.body.compName
    fs.mkdirSync('uploads/competitions/' + req.body.compName + '/gen')
    fs.mkdirSync('uploads/competitions/' + req.body.compName + '/eval')
    var dn1 = vettAndUpload(
        req.files.genfiletoupload,
        'uploads/competitions/' + cid + '/gen/',
        req.headers['content-length']
    )
    var dn2 = vettAndUpload(
        req.files.evalfiletoupload,
        'uploads/competitions/' + cid + '/eval/',
        req.headers['content-length']
    )
    if (dn1 && dn2) {
        // alert('Files Uploaded! Your competition ID is "' + cid + '".')
        res.json({
            message: 'Files Uploaded!',
            status: 200
        }).status(200)
    } else {
        console.log('Not accepted')
        return res
            .json({
                message: 'Not accepted',
                status: 401
            })
            .status(401)
    }
})

module.exports = router
