import {Routes,Route} from 'react-router-dom';
import Home from './Pages/Home';
import Login from './Pages/Login';
import TeamPage from './Pages/TeamPage'
import ThemePage from './Pages/Themepage';
import { Events } from './Pages/Events';
import { Merch } from './Pages/Merch';
import { EventDetail } from './Pages/EventDetails';
import Layout from './Layout';

const App = () => {
  return (
    <Routes>
      <Route path='/login'  element ={<Login/>} />
      <Route path ='/'  element ={<Layout />} >
        <Route index element={<Home />} />
        <Route path='/team' element ={<TeamPage/>} />
        <Route path='/theme' element={<ThemePage />} />
        <Route path='/events' element={<Events />} />
        <Route path='/merch' element={<Merch />} />
        <Route path='/events/:eventId' element={<EventDetail/>} />
      </Route>
    </Routes>
    
  )
}

export default App
