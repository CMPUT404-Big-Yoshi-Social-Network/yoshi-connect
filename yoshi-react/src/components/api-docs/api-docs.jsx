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
import React from "react";

export default function ApiDocs() {
  //let html_docs = "";
  //const get_docs = async () => {
    //return await axios.get("/server/api-docs");
  //}
  //useEffect( () => {
    //html_docs = get_docs();
  //});
  const style = {
    position:'absolute',
    top:'0',
    left:'0',
    height:'100%',
    width:'100%',
    border:'0',
  }
  return(<iframe src="http://localhost:8080/api/api-docs" style={style} title="docs"></iframe>);
}