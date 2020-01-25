const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
var io = require('socket.io')(http);
const fs = require('fs')
const { exec } = require('child_process');
const downloadPath = './public/images/'
let imageList = []

function updateImageList(cb) {
    exec('node getFiles.js', (err, stdout, stderr) => {
        if (err) {
            console.error(error)
        } else {
            console.log(`${stdout}`);
            fs.readdir(downloadPath, function (err, localFiles) {
                imageList = localFiles
                cb(imageList)
            })
        }
    })
}

function init(socket) {
    setInterval(function (socket) { updateImageList(socket) }, 10000)
}
app.use(express.static('public'))
app.get('/', function (req, res) {
    res.sendFile(__dirname + 'index.html');
});
http.listen(3000, function () {
    console.log('Listening on *:3000');
});
io.on('connection', function (socket) {
    console.log('A user connected.');
    io.emit('test')
    socket.on('getImageList', function (socket) {
        console.log('got req')
        updateImageList(function (imageList) {
            io.emit('imageList', imageList)
        })
    })
});