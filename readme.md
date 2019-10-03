# Where Dit'Go? 
Where did it go?  
Where did all my money go?  

Use this mobile app to record expenses.  

It is under construction.  

## How to use
Run `dit` in Termux, and it will open your browser to present the app.  

## features
* The money amount input interface supports +-*/.  
* Git backup and version track your database.  
* Robust interrupt-proof file saving strategy.  
* Export your data free of charge. (The main reason I wrote this for myself)  

## Implementation
Declarative without optimization.  
For each update, request to get all entries from the databse.  

The JS frontend does all the computations. The Python backend is just a database.  

## Future works
* If I can interrupt pickle.dump, then allow preemtive database writes.  
* Does it make sense to git commit every time there is a DELETE request?  
