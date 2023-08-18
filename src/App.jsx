import { Navbar,Welcome,Footer,Services,Transactions} from './components';
// import './App.css'

const App = () => {

  return (
    // <h1 className="text-4xl font-bold underline text-center">Hello world!</h1> 
    <div className='min-h-screen'>
      <div className='gradient-bg-welcome'>
        <Navbar />
        <Welcome />
      </div>
      <Services />
      <Transactions />
      <Footer />
    </div>
  );
}

export default App
