import {Routes,Route} from 'react-router-dom';
import Home from './Pages/Home';
import Login from './Pages/Login';
import TeamPage from './Pages/TeamPage'
import ThemePage from './Pages/Themepage';
import { Events } from './Pages/Events';
import { Merch } from './Pages/Merch';
import { EventDetail } from './Pages/EventDetails';

const App = () => {
  return (
    <Routes>
      <Route path ='/'  element ={<Home/>} />
      <Route path ='/login'  element ={<Login/>} />
      <Route path = '/team' element ={<TeamPage/>} />
      <Route path='/theme' element={<ThemePage />} />
      <Route path='/events' element={<Events />} />
      <Route path='/merch' element={<Merch />} />
      <Route path='/events/:eventId' element={<EventDetail/>} />
    </Routes>
    
  )
}

export default App
