import './App.css';
import { RouterProvider } from 'react-router-dom';
import routes from './routes/route';

// function App() {
//   console.log('Render App');
//   return (
//     <Router>
//       <div className="App">
//         <Header/>
//         <div className='container mt-4'>
//           <ErrorAlert/>
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/topics" element={<Topic />} />
//           </Routes>
//         </div>
//       </div>
//     </Router>
//   );
// }

function App() {
	return <RouterProvider router={routes} />
}

export default App;
