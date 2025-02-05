import { Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import { EventDetail } from './Pages/EventDetails';
import { Events } from './Pages/Events';
import Home from './Pages/Home';
import Login from './Pages/Login';
import { Merch } from './Pages/Merch';
import MerchCheckout from './Pages/Merch/MerchCheckout';
import TeamPage from './Pages/TeamPage';
import ThemePage from './Pages/Themepage';

const App = () => {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/' element={<Layout />}>
        <Route index element={<Home />} />
        <Route path='/team' element={<TeamPage />} />
        <Route path='/team' element={<TeamPage />} />
        <Route path='/theme' element={<ThemePage />} />
        <Route path='/events' element={<Events />} />
        <Route path='/merch' element={<Merch />} />
        <Route path='/merch/checkout' element={<MerchCheckout />} />
        <Route path='/events/:eventId' element={<EventDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
