const { Author, Login } = require('../scheme/author.js');
const {checkUsername, removeLogin, checkExpiry, checkAdmin} = require("../routes/auth.js")

describe("Checking Username", () => {
    it.only("Should only allow usernames that don't already exist", async () => {
        // Set up return values for any database calls
        Author.findOne = jest.fn()
        .mockReturnValueOnce({ username: "allan" })
        .mockReturnValueOnce({ undefined});

        // Disable any console.log
        console.log = jest.fn().mockReturnValue({})

        // Test if the username is alrady in use
        await expect(checkUsername({body: {username: "allan"}})).resolves.toBe("In use");
        // Test if the username is free for use
        await expect(checkUsername({body: {username: "allan"}})).resolves.toBe("Not in use");
    }); 
});

