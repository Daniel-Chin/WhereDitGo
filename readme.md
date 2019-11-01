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
* Export your data free of charge. (The main reason I wrote this for myself)  

## Termux Dependencies
```
pkg install git
pkg install openssh
pkg install node
pkg install python
```

## Implementation
The project has a frontend and a backend (REST API).  
The frontend is in charge of UI and all the computations. The backend is just a database.  

### Data Structure
There are two databases: expensebase and tagbase.  
Each is a linked list of JSON objects.  
Each entry contains `id`, `time`, and `payload`:  
```JSON
{
    "id": "q4fq8p7f298", 
    "time": 1570200303,
    "payload": { ... }, 
    "next": "a8fowjefor", 
    "prev": "34781bcqoe"
}
```
The `payload` is a nested JSON object.  
For expensebase:  
```JSON
payload: {
    "amount": 3, 
    "currency_type": "dollar", 
    "tags": [
        "q43f09rjr", 
        "3489frh43"
    ], 
    "comment": "chicken sandwich", 
    "additionals": [
        {
            "name": "amortize", 
            "start": 215703482, 
            "end": 12437305
        }
    ]
}
```
For tagbase:  
```JSON
payload: {
    "id": "q43f09rjr", 
    "type": "{user || amount}",
    "name": "Train", 
    "explanation": "NJtransit train from NY penn to Millburn for 2019 semester", 
    "count": 18, 
    "correlations": [
        {
            "id": "qwf82h", 
            "count": 3
        }
    ]
}
```
The head of the linked list has `id` = '__head__'.  
The tail of the linked list has `id` = '__tail__'.  

In Python backend, expensebase and tagbase are stored on the file system as **Double Linked File List**. See https://github.com/Daniel-Chin/linkedfilelist  

### Backend API doc and implementation
The principle is to minimize frontend wait time of one request.  
This makes sense because there is only one frontend client.  

To the backend, `payload` is just a string.  
Backend does not parse the payload.  

The backend API provides the following methods:  

#### `get`
Query string `?whichdb={expense || tag}&id={id}`  
Note that `id` can be things like '__head__'.  
Backend responds with the entry described by `id`.  

#### `add`
POST variable: `{entry, whichdb={expense || tag}}`  
Add an entry to the database. Backend gives an id, and inserts the entry, making sure the database is sorted in terms of `time`.  
Frontend needs not provide `id`, `prev`  or `next` in the entry.  
To optimize search time, we start from the latest entry and traverse the linked list. We periodically access a random entry and jump to it if its `time` is closer to the target.  

#### `delete`
Query string `?whichdb={expense || tag}&id={id}`  
Delete the entry from the double linked list.  

#### `modify`
POST variable: `{entry, whichdb={expense || tag}, id={id}}`  
Similar to `add`. Backend finds the corresponding file and rewrite its content. Re-sort the entry according to time.  

#### `commit`
Query string `?message={message}`  
Backup the two databases by doing `git add -A` and `git commit -m {message}`.  
Responds with the output text from git.  

#### `gitConfig`
Query string `?whichdb={expense || tag}&command={command}`  
`command` can be things like `--get remote.origin.url` or `core.sshCommand "ssh -p 27"`
Responds with the output text from git.  

#### `push`
Push the git repo to remote.  
Responds with the output text from git.  

#### `shutdown`
Shutdown the backend.  

#### `diagnose`
Diagnose the database for problems and send result to frontend.  

#### `display`
Query string `?whichdb={expense || tag}`  
For debug only.  
Backend prints the entire database to Termux console.  

## Future works
* Does it make sense to git commit every time there is a DELETE/MODIFY request?  
* Since tag entry has time data, allow tag redefinition according to time?  

## Discussion
* Why not have batch `get` to save to request-response cycles? Because content-length cannot be determined in advance.  

'''
Tag autofill amount
Amount predicts tags
'''
