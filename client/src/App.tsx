import {Routes,Route} from 'react-router-dom';
import Home from './Pages/Home';
import Login from './Pages/Login';
import TeamPage from './Pages/TeamPage'
import ThemePage from './Pages/Themepage';
import EventsPage from './Pages/EventsPage';

const App = () => {
  return (
    <Routes>
      <Route path ='/'  element ={<Home/>} />
      <Route path ='/login'  element ={<Login/>} />
      <Route path = '/team' element ={<TeamPage/>} />
      <Route path='/theme' element={<ThemePage />} />
      <Route path='/events' element={<EventsPage />} />
    </Routes>
  )
}

export default App
