# Where Dit'Go? 
Where did it go?  
Where did all my money go?  

Use this mobile app to record expenses.  

It is under construction.  

## How to use
Run `dit` in Termux, and it will open your browser to present the app.  

## features
* The money amount input interface supports +-*/.  
* Git backup and version track your database. (Periodic + manual)  
* Robust interrupt-proof file saving strategy.  
* Export your data free of charge. (The main reason I wrote this for myself)  

## Implementation
I use declarative programming without any performance optimization.  

The project has a JS frontend and a Python backend (REST API).  
The JS frontend is in charge of UI and all the computations. The Python backend is just a database.  
Each time JS frontend requests a change in the database, Python backend responds the request with the entire database in JSON, and JS frontend updates the UI.  

### Data Structure
The database is a JSON array of "entries".  
Each entry contains `token`, `time`, and `payload`:  
```JSON
{	# named tuple
    token: 'q4fq8p7f298'
    time: 394827
    payload: {
        amount: 3
        currency_type: dollar
        tags: [
            ...
        ]
        comment: chicken sandwich
    }
}
```

### Python backend implementation
The principle is to minimize frontend wait time of one request.  
This makes sense because there is only one frontend client.  
For the same reason, the Python backend is also single-thread.  

The Python backend API provides the following methods:  
(Note that modify = `delete`+`add`; delete = `delete`+`save`)  

#### `getAll`
Responds with the entire database.  
Here we send the database file on the harddrive.  

#### `add`
Expects a POST request.  
Add an entry to the database. Python inserts the entry, making sure the database is sorted in terms of `time`. Responds with the entire database.  
Here, as we iterate through the database in RAM, we do four things for each entry:  
1. Perform the `add` operation  
2. Perform the `delete` operation (explained later)  
3. Send entry to frontend  
4. Write entry to local file  

#### `delete`
JS frontend provides `token`.  
Python remembers the token.  
The next time we `add` or `save`, when we iterate through the database, delete the entry.  

#### `save`
Saves the database to local file.  
Here, as we iterate through the database in RAM, we do three things for each entry:  
1. Perform the `delete` operation (explained in `delete`)  
2. Send entry to frontend  
3. Write entry to local file  

The sole purpose of `save` is to work with `delete`.  

#### `git`
Backup the database by doing `git add -A` and `git commit -m "automatic"`.  
Responds with the output message.  

#### `shutdown`
Shutdown the Python backend.  

## Future works
* If I can interrupt pickle.dump, then allow preemtive database writes.  
* Does it make sense to git commit every time there is a DELETE request?  
