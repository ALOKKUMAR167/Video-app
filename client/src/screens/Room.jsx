import React , { useEffect , useCallback, useState}from 'react'
import { useSocket } from '../context/SocketProvider'
import ReactPlayer from 'react-player';
import peer from "../service/peer";

const Room = () => {
    const socket = useSocket();
    const [remoteSocketId , setRemoteSocketId] = useState(null);
    const [myStream , setMyStream] = useState()

    const handleUserJoined = useCallback(({email,id})=>{
        console.log(`email ${email} Joined the room`);
        setRemoteSocketId(id)
    },[]);

    const handleCallUser = useCallback( async()=>{
        const stream = await navigator.mediaDevices.getUserMedia({
            audio:true,
            video: true,
        });
        const offer = await peer.getOffer();
        socket.emit("user:call",{to: remoteSocketId , offer})
        setMyStream(stream)
    },[remoteSocketId,socket])

    const handleIncommingCall = useCallback(async({from,offer})=>{
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio:true,
            video: true,
        });
        setMyStream(stream)
        console.log(`incomming call`,from,offer);
        const ans = await peer.getAnswer(offer);
        socket.emit("call:accepted", {to:from,ans})
    },[socket])

    const handleCallAccepted = useCallback(
        ({ from, ans }) => {
          peer.setLocalDescription(ans);
          console.log("Call Accepted!");
        //   sendStreams();
        },
        // [sendStreams]
      );

    useEffect(()=>{
        socket.on('user:joined', handleUserJoined);
        socket.on('incomming:call', handleIncommingCall);
        socket.on("call:accepted", handleCallAccepted);

        return () =>{
            socket.off("user:joined",handleUserJoined);
            socket.off('incomming:call', handleIncommingCall);
            socket.off("call:accepted", handleCallAccepted);
        }
    },[socket,handleUserJoined,handleIncommingCall],handleCallAccepted);

  return (
    <div>
        <h1>Room call</h1>
        <h4>{remoteSocketId ? "connected" : "NO one in the room"}</h4>
        {
            remoteSocketId && <button onClick={handleCallUser}>CALL</button>
        }
        {myStream && (
            <>
            <h1>MY stream</h1>
            <ReactPlayer 
            playing
            muted
            height= "300px"
            width="500px"
            url={myStream}/>
            </>
        )}
    </div>
  )
}

export default Room