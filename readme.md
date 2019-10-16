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
There are two databases: expensebase and tagbase.  
Each is a linked list of JSON objects.  
Each entry contains `id`, `time`, and `payload`:  
```JSON
{
    "id": "q4fq8p7f298", 
    "time": 1570200303,
    "payload": "...", 
    "next": "a8fowjefor", 
    "prev": "34781bcqoe"
}
```
The `payload` is a nested JSON string.  
For expensebase:  
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

The head of the linked list has `id` = '__head__'.  
The tail of the linked list has `id` = '__tail__'.  

In Python backend, expensebase and tagbase are stored on the file system as **Double Linked File List**. Each entry is a file, with `id` as its filename.  

This may occupy extra space on large-cluster file systems, but this strategy ensures low time complexity of insertion and deletion.  

### Python backend API doc and implementation
The principle is to minimize frontend wait time of one request.  
This makes sense because there is only one frontend client.  
For the same reason, the Python backend is single-thread.  

To Python backend, `payload` is just a string.  
Python does not parse the payload.  

The Python backend API provides the following methods:  

#### `get`
Query string `?basename={expense || tag}&id={id}`  
Note that `id` can be things like '__head__'.  
Python backend responds with the entry described by `id`.  

#### `add`
Query string `?entry={encodeURI(json_of_entry)}`  
Add an entry to the database. Python checks for id collision, and inserts the entry, making sure the database is sorted in terms of `time`.  
To optimize search time, we first randomly access X entries and select the one with the closest time stamp and then traverse. X = sqrt(database size)  

#### `delete`
Query string `?id={id}`  
Delete the entry from the double linked list.  

### `modify`
Query string `?entry={encodeURI(json_of_entry)}`  
Similar to `add`. Python finds the corresponding file and rewrite its content. Re-sort the entry according to time.  

#### `git`
Query string `?message={message}`  
Backup the database by doing `git add -A` and `git commit -m {message}`.  
Responds with the output text from git.  

#### `shutdown`
Shutdown the Python backend.  

## Future works
* Does it make sense to git commit every time there is a DELETE/MODIFY request?  
* Since tag entry has time data, allow tag redefinition according to time?  

## Discussion
* Why don't I use POST for `add`? Because POST involves content encoding... Nah.  

'''
Tag autofill amount
'''
