import { Route, Routes } from 'react-router-dom'
import Login from './pages/admin/auth/LoginAdmin'
import SignIn from './pages/user/auth/SignIn'
import SignUp from './pages/user/auth/SignUp'
import Home from './pages/user/Home'
import HistoryUser from './pages/user/HistoryUserPage'
import CategoryUser from './pages/user/CategoryUserPage'

function RouterSetup() {
  return (
    <div>
        <Routes>
            <Route path="/admin/login" element={<Login />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<HistoryUser />} />
            <Route path="/categories" element={<CategoryUser />} />
            <Route path="*" element={<div>Not Found</div>} />
        </Routes>
    </div>
  )
}

export default RouterSetup
