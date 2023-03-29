/*
Copyright 2023 Kezziah Camille Ayuno, Alinn Martinez, Tommy Sandanasamy, Allan Ma, Omar Niazie

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


Furthermore it is derived from the Python documentation examples thus
some of the code is Copyright © 2001-2013 Python Software
Foundation; All Rights Reserved
*/

// Functionality
import axios from 'axios';
import React, { useState, useEffect } from 'react';

export default function Image(prop) {
    const url = window.location.pathname
    const [host, link] = url.split("authors")
    const [item, setItem] = useState("");

    useEffect(() => {
        console.log("/authors" + link)
        const getImage = () => {
            axios
            .get("/authors" + link)
            .then((res) => {
                if (res.data.status === 200) {
                    console.log(res.data.src)
                    setItem(res.data.src)
                } else {
                    setItem("")
                }
            })
        }
        getImage();
    }, [])

    return(<img className={"image"} src={item} alt=""/>);
  }