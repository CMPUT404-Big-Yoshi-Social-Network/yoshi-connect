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
  return(<iframe src="http://localhost:8080/server/api-docs" style={style} title="docs"></iframe>);
}