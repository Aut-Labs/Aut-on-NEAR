1. Improve the testing documentation 
2. The test scripts are in a package.json outside the integration-test folder, point this out in the documentation. I was confused.
3. Explain what is a worker and process and how do they work. 
4. Make a tutorial on adding an integration test for multiple contracts. 
5. return near.promiseResult(1), returns '"Milena"', there are quotes inside the string.
6. Make it super clear in the docs that the state won't work if it's not initalized when set as a property, even if it does in the initializer. 
   Example: 
    ```
    //owner: string;
    owner: string = '';

    @initialize({})
    init() {
        this.owner = near.predecessorAccountId();
    }

    ```
if the property is owner: string only, after init, the value of this.owner is undefined, although it's set in the init function. 
7. Implement "[]" operators for the maps/dictionaries