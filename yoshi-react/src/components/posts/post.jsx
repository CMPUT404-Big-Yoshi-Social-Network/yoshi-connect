import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useEffect, useState } from "react";
function Post() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        title: "",
        desc: "",
        contentType: "type/plain",
        visibility: "Public",
        content: "",
        unlisted: false,
        image: ""
    })
    const checkExpiry = () => {
        
    }
    useEffect(() => {
       checkExpiry();
    });
    const post_post = () => {
        console.log('Debug: Creating a post!')
        togglePostMenu()

        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            /////////////////////////////////////////////////////////////////////////////////////
            //Fix This Later
            url: '/server/authors/a9f468da-e50a-4a2d-805f-9e80ef49a681/posts/',
            /////////////////////////////////////////////////////////////////////////////////////
            headers: {
            'Content-Type': 'multipart/form-data'
            },
            data: data
        }
        
        console.log(config)
        axios.put('/server/authors/a9f468da-e50a-4a2d-805f-9e80ef49a681/posts/', config)
        .then((response) => {
            if ( response.data.status === 'Successful' ) {
            console.log("Debug: Token received.");
            console.log("Debug: Going to public feed.");
            navigate('/feed');
            }
        })
        .catch((e) =>{
            console.log(e);
        })}

    const [isOpen, setIsOpen] = useState(false)
    const togglePostMenu = () => {
        
        setIsOpen(!isOpen);
        console.log("Toggling post menu");
    }

    function previewFile() {
        const preview = document.querySelector("img");
        const file = document.querySelector("input[type=file]").files[0];
        const reader = new FileReader();
        const reader2 = new FileReader();
        reader2.onload = function (event) {
            // blob stuff
            var blob = new Blob([event.target.result]); // create blob...
            window.URL = window.URL || window.webkitURL;
            var blobURL = window.URL.createObjectURL(blob); // and get it's URL
            data.image = blobURL;
        }
    
        reader.addEventListener(
          "load",
          () => {
            // convert image file to base64 string
            preview.src = reader.result;
            // data.image = Buffer.from(reader.result, "base64");
          },
          false
        );
      
        if (file) {
          reader.readAsDataURL(file);
          reader2.readAsArrayBuffer(file);
        }
      }
    

    return (
        <body className={"tempBackground"}>
            <button className={"createPostButton"} type={"button"} value={"Create Post"} onClick={togglePostMenu}>CREATE NEW POST</button>
            {isOpen &&    
                <div className={"postMenuPage"}>
                    <div className={"postMenuBox"}>
                    <button className={"postMenuCloseButton"} onClick={togglePostMenu}>x</button>
                    <h1 className={"createPostHeader"}>Create New Post</h1>
                    <hr size={"2px"} width={"fill"} color={"white"}/>
                    <form encType='multipart/form-data'>
                        <label><p style={{color:"white"}}>Content Type</p></label>
                        <label><p style={{color:"white"}}>Visibility</p></label>
                        <label><p style={{color:"white"}}>Listed</p></label>
                        <select className={"postMenuDropDown"} id={"contentType"} name={"contentType"}onChange={(e) => {
                            setData({...data, contentType: e.target.value})}}>
                            <option value={"plaintext"}>PLAIN TEXT</option>
                            <option value={"markdown"}>MARKDOWN</option>
                        </select>

                        <select className={"postMenuDropDown"} id={"visibility"} name={"visibility"} onChange={(e) => {
                            setData({...data, visibility: e.target.value})}}>
                            <option value={"Public"}>PUBLIC</option>
                            <option value={"Friends Only"}>FRIENDS</option>
                        </select>

                        <select className={"postMenuDropDown"} id={"unlisted"} name={"unlisted"} onChange={(e) =>{
                            let bool;
                            if(e.target.value === "True") bool = true;
                            else if(e.target.value === "False") bool = false;
                            setData({...data, unlisted: bool})
                        }} >
                            <option value="True">False</option>
                            <option value="False">True</option>
                        </select>


                        <label><p style={{color:"white"}}>Title</p></label>
                        <input className={"postMenuInput"} type="text" onChange={(e) => {
                            setData({...data, title: e.target.value})
                        }}></input>

                        <label><p style={{color:"white"}}>Description</p></label>
                        <input className={"postMenuInput"} type="text" onChange={(e) => {
                            setData({...data, desc: e.target.value})
                        }}></input>


                        <label><p style={{color:"white"}}>Content</p></label>
                        <textarea className={"postMenuInput"} id={"description"} name={"description"} rows={"8"}
                                    wrap="physical" maxLength={"150"} onChange={(e) =>{
                            setData({...data, content: e.target.value})
                        }}/>
                        <div style={{color:"white", textAlign:"right"}}>
                            0/150 (doesn't actually count)
                        </div>
                        
                        <div className={"postMenuInput"}>
                        <input type={"file"} accept={"image/*"} multiple = "false" className={"postMenuImageInput"} name={"image"} id={"image"} onChange={previewFile}/>
                        <br/>
                        <img src="" style={{maxHeight: "15vh"}} alt="" />
                        </div>

                        <div style={{color:"white", textAlign:"right"}}>
                            25MB (not enforced)
                        </div>

                        <button className={"createPostButton"} type={"button"} onClick={post_post}>Create Post</button>
                    </form>
                </div>
            </div>
            }   
        </body>        
    )
}

export default Post;