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
    return (
        <form>
            <label><p>Title</p></label>
            <input type="text" onChange={(e) => {
                setData({...data, title: e.target.value})
            }}></input>
            <label><p>Description</p></label>
            <input type="text" onChange={(e) => {
                setData({...data, description: e.target.value})
            }}></input>
            <label><p>Format</p></label>
            <select id="format" name="format" onChange={(e) => {
                setData({...data, format: e.target.value})
            }}>
                <option value="plaintext">plaintext</option>
                <option value="markdown">MarkDown</option>
            </select>
            <label><p>Scope</p></label>
            <select id="scope" name="scope" onChange={(e) =>{
                setData({...data, scope: e.target.value})
            }} >
                <option value="Public">Public</option>
                <option value="Friends Only">Friends Only</option>
            </select>
            <label><p>Content</p></label>
            <textarea name="description" rows="20" columns="70" onChange={(e) =>{
                setData({...data, content: e.target.value})
            }}>

            </textarea>
            <div>
                <button type="button" onClick={post_post}>Submit</button>
            </div>
        </form>
    )
}

export default Post;