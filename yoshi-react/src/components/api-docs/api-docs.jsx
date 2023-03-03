import axios from 'axios';
import React, { useEffect, useState } from "react";

export default function ApiDocs() {
  //let html_docs = "";
  //const get_docs = async () => {
    //return await axios.get("/server/api-docs");
  //}
  //useEffect( () => {
    //html_docs = get_docs();
  //});
  const get_docs = (e) => {
    e.prevent_default()
  }

  let docs = undefined;
  let callRef = React.createRef();
  useEffect(() => {
    docs = axios.get("/server/api-docs");
  })
  return(<iframe src="http://localhost:8080/server/api-docs"></iframe>);
}