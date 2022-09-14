# Pagoda journey

During this hackathon we aimed to bring Aut Protocol to the NEAR Ecosystem. Aut Protocol was started and built in the EVM ecosystem. 
Translating the Aut Protocol contracts was challenging, but super fun. I have experience with TS in the context of Node JS. 
The Pagoda team has been super super nice, helping out and solving problems with me throughout the entire hack. Kuddos to Guillermo! 

I'll try to summarize here what I found to be missing in the docs and what were the confusing for me parts in the API. 


#1. Mappings and other complex types

* It is very contraintuitive that even though we're working with Type Script, the type of the elements in a mapping/vector are not typed. 
  I'd expect to initialize a mapping like this 

```map: UnorderedMap = new UnorderedMap<string>('map');```
```vec: Vector = new Vector<bool>('vec');```
* It is contraintuitive not to be able to use operators [] for mapping. It is the most used and obvious way to do it. I'd really love it if you were to implement this, if not make it suuuper super clear in the docs. 
  ```
  const val = map[key];
  map[key] = value;
  ``` 
  as opposed to currently 
   ```
  const val = map.get(key);
  map.set(key, value);
  ``` 
  
* Nested mappings work only after serialization - mention this in the docs, add an example. 
```
let nestedMap = UnorderedMap.deserialize(this.mapOfMap.get(key) as UnorderedMap) as UnorderedMap;
let nestedVal = nestedMap.get(nestedKey);
```
as opposed to 
```
let nestedVal = this.mapOfMap.get(key).get(nestedKey)
``` 
or 
```
let nestedVal = this.mapOfMap.[key][nestedKey]
``` 

#2. Testing
* The way that tests work are generally confusing. 
  * You'd naturally look for scripts in the package.json inside integration-tests, but it isn't there, it's in the outside one. 
  * In the docs it's not clear that you set a context in the script for a specific wasm. 
  * Initially for me it was confusing what are worker and process
  * In the documentation it is not shown how to deploy a contract from a test. There is an example, but it'd still be nice to be in the docs.

#3. State 
* Make it super clear in the docs that the state won't work if it's not initalized when set as a property, even if it does in the initializer. 
   Example: 

    ```
    //prop: string;
    prop: string = '';

    @initialize({})
    init() {
        this.prop = 'initial value'
    }
    ```

#4. One little bug
`return near.promiseResult(1)`, returns '"result string"', there are quotes inside the string.

#5. General recommendation
* Add style guide in the documentation - what kind of case we're using for functions, propoerties etc. Good practices, commonly used designed patterns etc. It's a bit inconsistent. In the examples I see a lot of snake_case but also quite a lot of camelCase. 
* Make reusable NFT standard as an npm package for easier implementation.
* In the docs there's a lot of old API versions code, for instance there are examples that implement contracts as: 
```
ContractName extends NearContract {
    constructor() {
        // ...
    }
}
``` 
In the beginning I was confused on what's the difference, which one is better etc.
  