import React from "react";

function Request(props) {
    const { senderId } = props;
    const addRequest = () => {
        console.log('Debug: Adding Author')
    }
    const rejectRequest = () => {
        console.log('Debug: Adding Author')
    }
    return (
        <div>
            { senderId }
            <button type="button" id='accept' onClick={() => addRequest()}>Add</button>
            <button type="button" id='reject' onClick={() => rejectRequest()}>Reject</button>
        </div>
    )
}

export default Request;