import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useEffect, useState } from "react";
function Post() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        title: "",
        description: "",
        format: "plaintext",
        scope: "Public",
        content: ""
    })
    const checkExpiry = () => {
        
    }
    useEffect(() => {
       checkExpiry();
    });
    const post_post = () => {
        togglePostMenu()

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: '/server/post',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      }

      axios(config)
      .then((response) => {
        if ( response.data.status === 'Successful' ) {
          console.log("Debug: Token received.");
          console.log("Debug: Going to public feed.");
          navigate('/feed');
        }
      })
      .catch((e) =>{
        console.log(e);
      })
    }

    const [isOpen, setIsOpen] = useState(false)
    const togglePostMenu = () => {
        setIsOpen(!isOpen);
    }

    const PostMenu = props => {
        return (
            <div className={"postMenuPage"}>
                <div className={"postMenuBox"}>
                    <button className={"postMenuCloseButton"} onClick={togglePostMenu}>x</button>
                    <h1 className={"createPostHeader"}>Create New Post</h1>
                    <hr size={"2px"} width={"fill"} color={"white"}/>
                    <form>
                        <select className={"postMenuDropDown"}  id={"format"} name={"format"} onChange={(e) => {
                            setData({...data, format: e.target.value})
                        }}>
                            <option value={"plaintext"}>Plain Text</option>
                            <option value={"markdown"}>MarkDown</option>
                        </select>
                        <select className={"postMenuDropDown"}  id={"scope"} name={"scope"} onChange={(e) =>{
                            setData({...data, scope: e.target.value})
                        }} >
                            <option value={"Public"}>Public</option>
                            <option value={"Friends Only"}>Friends Only</option>
                        </select>
                        {/*<label><p>Title</p></label>*/}
                        {/*<input type={"text"} onChange={(e) => {*/}
                        {/*    setData({...data, title: e.target.value})*/}
                        {/*}}></input>*/}
                        <label><p style={{color:"white"}}>Description</p></label>
                        <textarea className={"postMenuInput"} id={"description"} name={"description"} rows={"8"}
                                  wrap="physical" maxLength={"150"} onChange={(e) =>{
                            setData({...data, content: e.target.value})
                        }}/>
                        <div style={{color:"white", textAlign:"right"}}>
                            0/150
                        </div>
                        <label><p style={{color:"white"}}>Image Upload</p></label>
                        <textarea className={"postMenuInput"} id={"image"} name={"impage"} rows={"8"} wrap="physical" onChange={(e) =>{
                            setData({...data, content: e.target.value})
                        }}/>
                        <div style={{color:"white", textAlign:"right"}}>
                            25MB
                        </div>
                        <button className={"createPostButton"} onClick={post_post}>Create Post</button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div>
            <input
                type={"button"}
                value={"Create Post"}
                onClick={togglePostMenu}
            />
            {isOpen && <PostMenu/>}
        </div>
    )
}

export default Post;