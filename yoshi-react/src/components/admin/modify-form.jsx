import React from "react";

function ModifyAuthor() {
    return (
        <div id='modify'>
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
                <label>
                    About:
                    <input type="about" name="about" />
                </label>
                <label>
                    Pronouns:
                    <input type="pronouns" name="pronouns" />
                </label>
                <label>
                    Admin:
                    <input type="admin" name="admin" />
                </label>
                <input type="submit" value="Modify Author" />
            </form>
        </div>
    )
}

export default ModifyAuthor;