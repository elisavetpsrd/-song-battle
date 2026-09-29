const express=require('express');const http=require('http');const {Server}=require('socket.io');const path=require('path');
const app=express(),server=http.createServer(app),io=new Server(server);app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(__dirname));
const rooms={}; const code=()=>String(Math.floor(1000+Math.random()*9000));
io.on('connection',s=>{
 s.on('create',cb=>{let c;do c=code();while(rooms[c]);rooms[c]={score:{A:0,B:0},buzz:null};s.join(c);s.data={room:c,host:true};cb(c);io.to(c).emit('state',rooms[c]);});
 s.on('join',({room,team},cb)=>{if(!rooms[room])return cb(false);s.join(room);s.data={room,team};cb(true);io.to(room).emit('notice',`TEAM ${team} συνδέθηκε`);});
 s.on('buzz',()=>{let r=rooms[s.data.room];if(!r||r.buzz)return;r.buzz=s.data.team;io.to(s.data.room).emit('state',r);});
 s.on('reset',()=>{let r=rooms[s.data.room];if(r){r.buzz=null;io.to(s.data.room).emit('state',r);}});
 s.on('point',team=>{let r=rooms[s.data.room];if(r&&r.score[team]!=null){r.score[team]++;r.buzz=null;io.to(s.data.room).emit('state',r);}});
 s.on('audio',action=>io.to(s.data.room).emit('audio',action));
});server.listen(process.env.PORT||3000,()=>console.log('Song Battle running'));
