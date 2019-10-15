# Where Dit'Go? 
**It is under construction!!!**  

Where did it go?  
Where did all my money go?  

Use this mobile app to record expenses.  

## How to use
Run `dit` in Termux, and it will open your browser to present the app.  
Best with Termux Widget.  

## Features
* Tag your expenses, explain your tags, rename your tags  
* Smart tag suggestions using Bayes Rule.  
* The money amount input interface supports +-*/.  
* Git backup and version track your database.  
* Robust interrupt-proof file saving strategy.  
* Export your data free of charge. (The main reason I wrote this for myself)  

## Implementation
I use declarative programming without any performance optimization.  

The project has a JS frontend and a Python backend (REST API).  
The JS frontend is in charge of UI and all the computations. The Python backend is just a database.  
Each time JS frontend requests a change in the database, Python backend responds the request with the entire database in JSON, and JS frontend updates the UI.  

To avoid CORS check, a proxy server sits in the middle.  
```
                  / Python backend  
browser - proxy -<  
                  \ React server  
```
All api requests prefixes the http target with 'BACKEND'.  

### Data Structure
The database is a JSON array of "entries".  
Each entry contains `token`, `time`, and `payload`:  
```JSON
{
    token: "q4fq8p7f298", 
    time: 1570200303,
    payload: "...", 
}
```
The `payload` is a nested JSON string, which can either be an "expense entry" or a "tag definition":  
```JSON
payload: {
    type: "expense", 
    amount: 3, 
    currency_type: "dollar", 
    tags: [
        "Train", 
        ...
    ], 
    comment: "chicken sandwich", 
}
```
or  
```JSON
payload: {
    type: "tag", 
    tag_name: "Train", 
    explanation: "NJtransit train from NY penn to Millburn for 2019 semester", 
}
```
Again, the above uses the object representation for the ease of reaading, but in reality this `payload` is encoded into JSON string.  

In Python backend, it is stored in RAM as a list of dicts.  

### Python backend implementation
The principle is to minimize frontend wait time of one request.  
This makes sense because there is only one frontend client.  
For the same reason, the Python backend is also single-thread.  

To Python backend, `payload` is just a JSON string. 
JS can have whatever in the payload. 
Note: payload is not an object, but a JSON. So Each entry is a nested JSON. 

The Python backend API provides the following methods:  
(Note that modify = `delete`+`add`; delete = `delete`+`save`)  
(Benefit: so that `modify` is "atomic" in terms of persistent storage)  

#### `getAll`
Responds with the entire database.  
Here we send the database file on the harddrive.  

#### `add`
Query string ?entry={`encodeURI(json_of_entry)`}  
Add an entry to the database. Python checks for token collision, and inserts the entry, making sure the database is sorted in terms of `time`.  
Here, as we iterate through the database in RAM, we do three things for each entry:  
1. Perform the `add` operation  
2. Perform the `delete` operation (explained later)  
3. Write entry to local file  

Finally the database reloads from the file.  

#### `delete`
Query string ?token={`token`}  
Python remembers the token.  
The next time we `add` or `save`, when we iterate through the database, delete the entry.  

#### `save`
Saves the database to local file.  
Here, as we iterate through the database in RAM, we do two things for each entry:  
1. Perform the `delete` operation (explained in `delete`)  
2. Write entry to local file  

Finally the database reloads from the file.  
The sole purpose of `save` is to work with `delete`.  

#### `git`
Query string ?message={`message`}  
Backup the database by doing `git add -A` and `git commit -m {message}`.  
Responds with the output text from git.  

#### `shutdown`
Shutdown the Python backend.  

## Future works
* Does it make sense to git commit every time there is a DELETE request?  

## Discussion
* Why don't I use POST for `add`? Because POST involves content encoding, so I would have to respond to OPTIONS and HEAD... Nah.  
* Why don't I send the entries to the client while we iterate through the database for `add` and `save`? Well, the backend doesn't know `content-length` in advance, and [Chunked Transfer Coding](https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.6.1) is too much of a rabbit hole for this app. Since I decided not to use other people's web serving libraries, and my purpose here is not to write such a library, I might as well keep everything simple.  
* Since tag entry has time data, allow tag redefinition according to time?  

'''
Tag autofill amount
'''
