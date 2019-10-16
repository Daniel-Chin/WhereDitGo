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
The project has a JS frontend and a Python backend (REST API).  
The JS frontend is in charge of UI and all the computations. The Python backend is just a database.  

### Data Structure
There are two databases: entrybase and tagbase.  
Each is a linked list of JSON objects.  
Each object contains `id`, `time`, and `payload`:  
```JSON
{
    "id": "q4fq8p7f298", 
    "time": 1570200303,
    "payload": "..."
}
```
The `payload` is a nested JSON string.  
For entrybase:  
```JSON
payload: {
    "amount": 3, 
    "currency_type": "dollar", 
    "tags": [
        "q43f09rjr", 
        "3489frh43"
    ], 
    "comment": "chicken sandwich"
}
```
For tagbase:  
```JSON
payload: {
    "id": "q43f09rjr", 
    "name": "Train", 
    "explanation": "NJtransit train from NY penn to Millburn for 2019 semester"
}
```
Again, the above uses the object representation for the ease of reaading, but in reality this `payload` is encoded into JSON string.  

In Python backend, it is stored on the file system as a **linked file list**:  
| File name    | id   |             |   |   |  
|--------------|------|-------------|---|---|  
|              | next | next id     |   |   |  
| File content | ---  |             |   |   |  
|              | this | JSON object |   |   |  

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
