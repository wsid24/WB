// import Board from "./components/Board";
// import Toolbar from "./components/Toolbar";
// import Toolbox from "./components/Toolbox";
// import BoardProvider from "./store/BoardProvider";
// import ToolboxProvider from "./store/ToolboxProvider";

// import { useState, useEffect } from "react";

// function App() {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     fetch('http://localhost:3030/users')
//       .then(response => response.json())
//       .then(data => setData(data))
//       .catch(error => console.error('Error fetching data:', error));
//   }, []);

//   return (
//   //   <BoardProvider>
//   //     <ToolboxProvider>
//   //       <Toolbar />
//   //       <Board />
//   //       <Toolbox />
//   //     </ToolboxProvider>
//   //   </BoardProvider>

//     <div>
//       <h1>User Data from Backend</h1>
//       {data ? <p>{data.message}</p> : <p>Loading...</p>}  
//     </div>  
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Canvases from './pages/Canvases';
import Canvas from './pages/Canvas';
import ThemeProvider from './store/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/canvases" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/canvases" element={<Canvases />} />
          <Route path="/canvas/:id" element={<Canvas />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;