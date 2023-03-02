import React from "react";

function ModifyAuthor() {
    return (
        <div id='modify'>
            <form>
                <label>
                    Username:
                    <input type="username" name="username" />
                </label>
                <br></br>
                <label>
                    Password:
                    <input type="password" name="password" />
                </label>
                <br></br>
                <label>
                    Email:
                    <input type="email" name="email" />
                </label>
                <br></br>
                <label>
                    About:
                    <input type="about" name="about" />
                </label>
                <br></br>
                <label>
                    Pronouns:
                    <input type="pronouns" name="pronouns" />
                </label>
                <br></br>
                <label>
                    Admin:
                    <input type="admin" name="admin" />
                </label>
                <br></br>
                <input type="submit" value="Modify Author" />
            </form>
        </div>
    )
}

export default ModifyAuthor;