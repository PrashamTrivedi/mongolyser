# mongolyser

A tool that can help you analyse, diagnose and debug performance issues in your MongoDB deployment. It can also help you to monitor general health of your current MongoDB deployment. It current has the following features:
1. Query Profiling
2. Query Performance Assesment & Profiling 
2. Log analysis 
3. Query Pattern Analysis
4. Write Load ( Oplog ) analysis
5. Connection Analysis
6. Index Analysis


To start using the tool, you can download the executable(s) from [here](https://github.com/Gobind03/mongolyser/releases/latest).

# Running directly from the source code

1. Clone the repository
  ```
  $ git clone https://github.com/Gobind03/mongolyser.git
  ```
2. Enter the directory & install dependencies
  ```
  $ cd mongolyser
  $ npm i
  ```
3. Run the tool
  ```
  $ npm run electron:start
  ```
  
**Note:** If in case you see a blank window after starting the application, press Ctrl+R on Windows or Cmd+R on MAC to refresh the electron window and re-load the react application in the window frame. 
