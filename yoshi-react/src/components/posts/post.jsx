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
        togglePostMenu()

      let config = {
        method: 'put',
        maxBodyLength: Infinity,
        /////////////////////////////////////////////////////////////////////////////////////
        //Fix This Later
        url: '/server/authors/a70c9729-fb37-4354-8b69-9d71aad3c6f9/posts/',
        /////////////////////////////////////////////////////////////////////////////////////
        headers: {
          'Content-Type': 'multipart/form-data'
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
    const post_image = () => {
      let formData = new FormData();
      let imageFile = document.querySelector('#image');
      formData.append("image", imageFile.files[0]);

      /////////////////////////////////////////////////////////////////////////////////////
      //Fix This Later
      axios.put('/server/authors/a70c9729-fb37-4354-8b69-9d71aad3c6f9/posts/', formData, {
      /////////////////////////////////////////////////////////////////////////////////////
        headers: {
            'Content-Type': 'multipart/form-data'
        }
      })
    }

    const [isOpen, setIsOpen] = useState(false)
    const togglePostMenu = () => {
        setIsOpen(!isOpen);
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
                    <form>
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
                        
                        <input type={"file"} accept={"image/*"} multiple = "false" className={"postMenuImageInput"} name={"image"} id={"image"} onChange={(e) =>{
                            setData({...data, image: e.target.files[0]})}}/>
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


//     return (
//         /
//         //     <input
//         //         type={"button"} value={"Create Post"} onClick={togglePostMenu}/>
//         //     {isOpen &&
//         //        
//         //   
//         //     }
//         // </div>
//     )
// }

// export default Post;