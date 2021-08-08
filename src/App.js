import { useState, useEffect } from 'react';
import { getAllCountries } from './api';
import './assets/App.css';
import Mapbox from './components/Mapbox';


function App() {
  const [loading, setLoading] = useState(true)
  const [data, setdata] = useState([])

  const fetchAllData = async () => {
    try {
      const allCases = await getAllCountries()
      setdata(allCases)
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    fetchAllData()
  }, [loading])
  return (
    <div>
      {
        loading ? (
          <div className={'container'}>
            <h1 style={{ color: 'white' }}>Loading...</h1>
          </div>
        ) : (
          <Mapbox allCoordinates={data} />
        )
      }
    </div>
  );
}

export default App;
