import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocs() {
    return(
      <SwaggerUI url="/server/api-docs.json"/>
    )
  }