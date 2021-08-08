import axios from "axios"
import env from "./config";

const { x_rapid_api_host, x_rapid_api_key, api_covid } = env

let options = {
    method: 'GET',
    url: api_covid,
    headers: {
        'x-rapidapi-key': x_rapid_api_key,
        'x-rapidapi-host': x_rapid_api_host
    }
};

const getAllCountries = () => new Promise(async (resolve, reject) => {
    try {
        const countries = await axios.request(options)
        resolve(countries.data.data)
    } catch (error) {
        reject(error)
    }
})


export { getAllCountries }