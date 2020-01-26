const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
var io = require('socket.io')(http);
const fs = require('fs')
const path = require('path');

const downloadPath = './public/studio-display/'
let imageList = []

function updateImageList(cb) {
    fs.readdir(downloadPath, function (err, localFiles) {
        imageList = []
        for (let i = 0; i < localFiles.length; i++){
            let stats = fs.statSync(downloadPath + localFiles[i])
            imageList.push({
                filename: localFiles[i],
                extension: path.extname(localFiles[i]),
                lastModified: stats.mtime
            })
        }
        cb(imageList)
    })
}

function init(socket) {
    setInterval(function (socket) { updateImageList(socket) }, 10000)
}
app.use(express.static('public'))
app.use(express.static('drive'))
app.get('/', function (req, res) {
    res.sendFile(__dirname + 'index.html');
});
http.listen(3000, function () {
    console.log('Listening on *:3000');
});
io.on('connection', function (socket) {
    console.log('A user connected.');
    socket.on('getImageList', function (socket) {
        console.log(new Date() + ': Building image list.')
        updateImageList(function (imageList) {
            io.emit('imageList', imageList) 
        })
    })
});