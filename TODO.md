*Analysis and Methodology*

**step one**
 
 - validate file format
 - extract filename
 - record timestamp
 - save in  a table called log ( user's email, originalFilename, uniqueFileName,
 timeStamp)
 - upload csv file to server (pipe the request)
 
**step two**
 - create a new table with uniqueFileName
 - extract columns 
 - save records in the table row by row (from pipe in step one if possible to decode the stream while it is not complete)
 

**step three**
 - list all file by user
 - remove file 
 
**step three**
 - display csv file in a grid
 - implement basic search
 

 
Note: us winston for log
  
  
Note: due to time limitations. I will cover only one sheet 