import React from "react";

function AddAuthor() {
    return (
        <div id='add'>
            <form>
                <label>
                    Username:
                    <input type="username" name="username" />
                </label>
                <label>
                    Password:
                    <input type="password" name="password" />
                </label>
                <label>
                    Email:
                    <input type="email" name="email" />
                </label>
                <input type="submit" value="Create Author" />
            </form>
        </div>
    )
}

export default AddAuthor;